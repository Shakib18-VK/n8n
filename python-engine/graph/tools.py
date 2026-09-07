from tools.job import smart_job_apply_assistant, find_jobs_from_query
from tools.whatsapp import send_whatsapp_notification
from tools.web import realtime_web_search
from tools.email import send_email
from tools.youtube import summarize_video
from tools.train import get_live_train_status
from tools.web import realtime_web_search
from tools.sports import get_live_cricket_score
from tools.weather_decision import get_weather
from tools.restaurant import search_restaurants
ALL_TOOLS = [
    smart_job_apply_assistant,
    find_jobs_from_query,
    send_whatsapp_notification,
    realtime_web_search,
    send_email,
    summarize_video,
    get_live_train_status,
    get_live_cricket_score,
    get_weather,
    search_restaurants
]
