from openai import AsyncOpenAI
from bs4 import BeautifulSoup
import httpx
import json
from app.core.config import settings
from typing import Optional

class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def extract_policy_text(self, url: str) -> str:
        """
        Extract privacy policy text from a given URL
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
                
            # Get text content
            text = soup.get_text()
            
            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text

    async def generate_summary(self, policy_text: str, custom_prompt: Optional[str] = None) -> dict:
        """
        Generate a comprehensive summary of the privacy policy using OpenAI
        """
        system_prompt = custom_prompt if custom_prompt else """
        You are a privacy policy analyzer. Analyze the given privacy policy text and provide a structured summary with the following information:
        1. key_points: List of main takeaways (max 5 points)
        2. data_collection: What data is being collected
        3. data_usage: How the data is being used
        4. data_sharing: Who the data is shared with
        5. user_rights: What rights users have
        6. privacy_risks: Any potential privacy concerns
        7. privacy_score: A score from 0-100 based on privacy-friendliness
        8. compliance_status: GDPR, CCPA compliance status
        
        Format the response as a JSON object with these exact field names.
        Make the summary concise but informative.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": policy_text}
                ],
                temperature=0.3,
                max_tokens=1000,
                response_format={ "type": "json_object" }
            )
            
            # Parse the JSON response
            summary = json.loads(response.choices[0].message.content)
            
            # Add metadata
            summary["analysis_version"] = "1.0"
            summary["model_used"] = "gpt-4"
            if custom_prompt:
                summary["custom_prompt_used"] = True
            
            return summary
            
        except Exception as e:
            raise Exception(f"Error generating summary: {str(e)}")

    async def analyze_readability(self, policy_text: str) -> dict:
        """
        Analyze the readability and complexity of the privacy policy
        """
        system_prompt = """
        Analyze the readability of this privacy policy. Provide:
        1. readability_score: 0-100 (higher is more readable)
        2. complexity_level: "Simple", "Moderate", or "Complex"
        3. average_sentence_length: in words
        4. technical_terms_count: number of technical/legal terms
        5. suggestions: List of improvements for better readability
        
        Format as JSON object.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": policy_text}
                ],
                temperature=0.3,
                max_tokens=500,
                response_format={ "type": "json_object" }
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            raise Exception(f"Error analyzing readability: {str(e)}")

    async def generate_quick_summary(self, policy_text: str) -> str:
        """
        Generate a quick, one-paragraph summary of the policy
        """
        system_prompt = "Summarize this privacy policy in one short paragraph, highlighting the most important points."
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # Using 3.5 for speed and cost efficiency
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": policy_text}
                ],
                temperature=0.3,
                max_tokens=150
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Error generating quick summary: {str(e)}")

    async def analyze_changes(self, old_policy: str, new_policy: str) -> dict:
        """
        Compare two versions of a privacy policy and identify changes
        """
        system_prompt = """
        Compare these two versions of a privacy policy and identify:
        1. major_changes: List of significant changes
        2. minor_changes: List of minor changes
        3. impact_level: "High", "Medium", or "Low"
        4. user_action_required: boolean
        5. summary: Brief summary of changes
        
        Format as JSON object.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Old policy:\n{old_policy}\n\nNew policy:\n{new_policy}"}
                ],
                temperature=0.3,
                max_tokens=1000,
                response_format={ "type": "json_object" }
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            raise Exception(f"Error analyzing changes: {str(e)}")
