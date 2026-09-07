import os
import requests
from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()


@tool()
def search_flight_price_insights(
    origin: str,
    destination: str,
    currency: str = "USD"
):
    """
    Get Google Flights price insights for a route.

    origin:
        IATA airport/city code, e.g. CDG

    destination:
        IATA airport/city code, e.g. STN

    currency:
        Currency code, e.g. USD, INR
    """

    api_key = os.getenv("RAPID_API_KEY")

    if not api_key:
        return {
            "error": "RAPID_API_KEY is missing in .env"
        }

    url = (
        "https://google-flights-scraper-search-api.p."
        "rapidapi.com/price/insights"
    )

    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-host":
            "google-flights-scraper-search-api.p.rapidapi.com",
        "x-rapidapi-key": api_key
    }

    params = {
        "origin": origin,
        "destination": destination,
        "currency": currency
    }

    try:

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=30
        )

        print("✈️ FLIGHT API STATUS:", response.status_code)

        if response.status_code != 200:
            return {
                "error": "Flight API failed",
                "status_code": response.status_code,
                "details": response.text
            }

        data = response.json()

        return data

    except requests.exceptions.Timeout:

        return {
            "error": "Flight API request timed out."
        }

    except requests.exceptions.RequestException as e:

        return {
            "error": f"Flight API request failed: {str(e)}"
        }

    except Exception as e:

        return {
            "error": f"Unexpected error: {str(e)}"
        }