from tools.job import smart_job_apply_assistant, find_jobs_from_query
from tools.whatsapp import send_whatsapp_notification
from tools.web import realtime_web_search
from tools.email import send_email
from tools.youtube import summarize_video

ALL_TOOLS = [
    smart_job_apply_assistant,
    find_jobs_from_query,
    send_whatsapp_notification,
    realtime_web_search,
    send_email,
    summarize_video,
]
