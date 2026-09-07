import os
import requests
from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

RAPID_API_KEY = os.getenv("RAPID_API_KEY")

RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com"
BASE_URL = "https://cricbuzz-cricket.p.rapidapi.com"


@tool
def get_live_cricket_score():
    """
    Get live cricket match information.
    """

    url = f"{BASE_URL}/matches/v1/live"

    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPID_API_KEY
    }

    try:
        if not RAPID_API_KEY:
            return {
                "error": "RAPID_API_KEY missing in .env"
            }

        response = requests.get(
            url,
            headers=headers,
            timeout=15
        )

        response.raise_for_status()

        return response.json()

    except requests.exceptions.HTTPError:
        return {
            "error": f"HTTP {response.status_code}: {response.text}"
        }

    except requests.exceptions.Timeout:
        return {
            "error": "Cricket API request timed out"
        }

    except requests.exceptions.RequestException as e:
        return {
            "error": f"Cricket API request failed: {str(e)}"
        }

    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}"
        }