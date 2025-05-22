from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from app.schemas.ai_summary import AISummaryCreate, AISummaryResponse, AISummaryCompare, PolicyCopyRequest
from app.services.ai_service import AIService
from app.services.supabase_service import SupabaseService
from app.core.auth import get_current_user

router = APIRouter()
ai_service = AIService()
supabase = SupabaseService()

@router.post("/analyze", response_model=AISummaryResponse)
async def analyze_policy(
    request: AISummaryCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze a privacy policy and generate an AI summary
    """
    try:
        # Extract policy text from URL if provided
        policy_text = request.policy_text
        if request.website_url and not policy_text:
            policy_text = await ai_service.extract_policy_text(request.website_url)

        # Create initial summary record
        summary_data = {
            "user_id": current_user["id"],
            "website_url": str(request.website_url),
            "policy_text": policy_text,
            "summary": {
                "status": "processing",
                "quick_summary": await ai_service.generate_quick_summary(policy_text)
            }
        }
        
        # Save initial summary
        saved_summary = await supabase.create_summary(summary_data)

        # Process full analysis in background
        background_tasks.add_task(
            process_full_analysis,
            saved_summary["id"],
            policy_text,
            current_user["id"]
        )

        return saved_summary

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=List[AISummaryResponse])
async def list_summaries(
    current_user: dict = Depends(get_current_user),
    limit: Optional[int] = 10,
    offset: Optional[int] = 0
):
    """
    List all AI summaries for the current user with pagination
    """
    try:
        summaries = await supabase.get_user_summaries(
            current_user["id"],
            limit=limit,
            offset=offset
        )
        return summaries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{summary_id}", response_model=AISummaryResponse)
async def get_summary(
    summary_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific AI summary by ID
    """
    try:
        summary = await supabase.get_summary(summary_id, current_user["id"])
        if not summary:
            raise HTTPException(status_code=404, detail="Summary not found")
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare", response_model=dict)
async def compare_policies(
    request: AISummaryCompare,
    current_user: dict = Depends(get_current_user)
):
    """
    Compare two versions of a privacy policy
    """
    try:
        changes = await ai_service.analyze_changes(
            request.old_policy_text,
            request.new_policy_text
        )
        return changes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{summary_id}")
async def delete_summary(
    summary_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a specific AI summary
    """
    try:
        success = await supabase.delete_summary(summary_id, current_user["id"])
        if not success:
            raise HTTPException(status_code=404, detail="Summary not found")
        return {"message": "Summary deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/copy-analyze", response_model=AISummaryResponse)
async def copy_and_analyze_policy(
    request: PolicyCopyRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Copy and analyze a policy text using either a default or custom prompt
    """
    try:
        # Get the prompt details if prompt_user_id is provided
        custom_prompt = None
        if request.prompt_user_id:
            custom_prompt = await supabase.get_user_prompt(request.prompt_user_id)
            if not custom_prompt:
                raise HTTPException(status_code=404, detail="Prompt not found")

        # Create summary data
        summary_data = {
            "user_id": current_user["id"],
            "website_url": str(request.website_url) if request.website_url else None,
            "policy_text": request.policy_text,
            "summary": {
                "status": "processing",
                "quick_summary": await ai_service.generate_quick_summary(request.policy_text),
                "prompt_user_id": request.prompt_user_id,
                "custom_prompt_used": bool(custom_prompt or request.custom_prompt)
            }
        }
        
        # Save initial summary
        saved_summary = await supabase.create_summary(summary_data)

        # Process full analysis in background with custom prompt if provided
        background_tasks.add_task(
            process_full_analysis_with_prompt,
            saved_summary["id"],
            request.policy_text,
            current_user["id"],
            request.custom_prompt or (custom_prompt.prompt if custom_prompt else None)
        )

        return saved_summary

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_full_analysis(summary_id: str, policy_text: str, user_id: str):
    """
    Background task to process full analysis
    """
    try:
        # Generate comprehensive summary
        summary = await ai_service.generate_summary(policy_text)
        
        # Add readability analysis
        readability = await ai_service.analyze_readability(policy_text)
        
        # Combine analyses
        full_analysis = {
            "status": "completed",
            **summary,
            "readability": readability,
        }
        
        # Update summary in database
        await supabase.update_summary(summary_id, user_id, {"summary": full_analysis})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_full_analysis_with_prompt(
    summary_id: str, 
    policy_text: str, 
    user_id: str,
    custom_prompt: Optional[str] = None
):
    """
    Background task to process full analysis with optional custom prompt
    """
    try:
        # Generate comprehensive summary with custom prompt if provided
        summary = await ai_service.generate_summary(
            policy_text,
            custom_prompt=custom_prompt
        )
        
        # Add readability analysis
        readability = await ai_service.analyze_readability(policy_text)
        
        # Combine analyses
        full_analysis = {
            "status": "completed",
            **summary,
            "readability": readability,
            "custom_prompt_used": bool(custom_prompt)
        }
        
        # Update summary in database
        await supabase.update_summary(summary_id, user_id, {"summary": full_analysis})
    except Exception as e:
        # Update status to error
        error_analysis = {
            "status": "error",
            "error": str(e)
        }
        await supabase.update_summary(summary_id, user_id, {"summary": error_analysis})
