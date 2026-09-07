import os
import requests

from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()


RAPIDAPI_HOST = "booking-com15.p.rapidapi.com"
BASE_URL = "https://booking-com15.p.rapidapi.com/api/v1"


@tool()
def search_hotels(
    location: str,
    check_in: str,
    check_out: str
):
    """
    Search hotel information for a destination.

    location:
        City/destination name, e.g. Paris

    check_in:
        Check-in date, e.g. 2026-09-20

    check_out:
        Check-out date, e.g. 2026-09-23
    """

    api_key = os.getenv("RAPID_API_KEY")

    if not api_key:
        return {
            "success": False,
            "error": "RAPID_API_KEY is missing in .env"
        }

    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": api_key
    }

    try:

        # -----------------------------------------
        # STEP 1: Convert location -> latitude/longitude
        # -----------------------------------------

        location_url = f"{BASE_URL}/hotels/searchDestination"

        location_params = {
            "query": location,
            "languagecode": "en-us"
        }

        location_response = requests.get(
            location_url,
            headers=headers,
            params=location_params,
            timeout=30
        )

        print(
            "📍 LOCATION API STATUS:",
            location_response.status_code
        )

        if location_response.status_code != 200:
            return {
                "success": False,
                "error": "Location API failed",
                "status_code": location_response.status_code,
                "details": location_response.text
            }

        location_data = location_response.json()

        print("📍 LOCATION RESULT:", location_data)

        # -----------------------------------------
        # STEP 2: Extract destination ID
        # -----------------------------------------

        results = location_data.get("data", [])

        if not results:
            return {
                "success": False,
                "error": f"Location not found: {location}"
            }

        destination = results[0]

        dest_id = destination.get("dest_id")

        if not dest_id:
            return {
                "success": False,
                "error": "Destination ID not found",
                "data": destination
            }

        print("📍 DESTINATION ID:", dest_id)

        # -----------------------------------------
        # STEP 3: Search hotels
        # -----------------------------------------

        hotel_url = f"{BASE_URL}/hotels/searchHotels"

        hotel_params = {
            "dest_id": dest_id,
            "search_type": "CITY",
            "arrival_date": check_in,
            "departure_date": check_out,
            "adults": "1",
            "room_qty": "1",
            "page_number": "1",
            "languagecode": "en-us",
            "currency_code": "USD"
        }

        hotel_response = requests.get(
            hotel_url,
            headers=headers,
            params=hotel_params,
            timeout=30
        )

        print(
            "🏨 HOTEL API STATUS:",
            hotel_response.status_code
        )

        if hotel_response.status_code != 200:
            return {
                "success": False,
                "error": "Hotel search API failed",
                "status_code": hotel_response.status_code,
                "details": hotel_response.text
            }

        hotel_data = hotel_response.json()

        # -----------------------------------------
        # STEP 4: Return hotel results
        # -----------------------------------------

        return {
            "success": True,
            "location": location,
            "check_in": check_in,
            "check_out": check_out,
            "results": hotel_data
        }

    except requests.exceptions.Timeout:

        return {
            "success": False,
            "error": "Hotel API request timed out."
        }

    except requests.exceptions.RequestException as e:

        return {
            "success": False,
            "error": f"Hotel API request failed: {str(e)}"
        }

    except Exception as e:

        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }