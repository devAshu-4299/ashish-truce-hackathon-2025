-- Create user_prompts table
create table if not exists user_prompts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    title text not null,
    prompt text not null,
    description text,
    is_public boolean default false,
    usage_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for user_id
create index if not exists idx_user_prompts_user_id on user_prompts(user_id);

-- Enable RLS on user_prompts
alter table user_prompts enable row level security;

-- RLS policies for user_prompts
create policy "Users can view their own prompts"
    on user_prompts for select
    using (auth.uid() = user_id or is_public = true);

create policy "Users can create their own prompts"
    on user_prompts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own prompts"
    on user_prompts for update
    using (auth.uid() = user_id);

create policy "Users can delete their own prompts"
    on user_prompts for delete
    using (auth.uid() = user_id);

-- Add columns to ai_summaries table
alter table ai_summaries
    add column if not exists prompt_id uuid references user_prompts,
    add column if not exists custom_prompt text,
    add column if not exists prompt_user_id uuid references auth.users;

-- Add trigger for updating usage count
create or replace function increment_prompt_usage()
returns trigger as $$
begin
    if NEW.prompt_id is not null then
        update user_prompts
        set usage_count = usage_count + 1
        where id = NEW.prompt_id;
    end if;
    return NEW;
end;
$$ language plpgsql;

create trigger prompt_usage_counter
    after insert on ai_summaries
    for each row
    execute function increment_prompt_usage();
