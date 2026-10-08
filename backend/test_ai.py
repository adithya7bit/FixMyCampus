import os
# Inject the key for testing
# os.environ["GROQ_API_KEY"] = "YOUR_GROQ_API_KEY"

from services.ai_service import analyze_complaint

test_cases = [
    {
        "title": "Electrical hazard",
        "description": "There is an exposed wire sparking near the water cooler on the ground floor.",
        "location": "Hostel Block B, Ground Floor"
    },
    {
        "title": "Water leakage",
        "description": "The pipe under the sink in the men's washroom is broken and flooding.",
        "location": "Academic Block A, 2nd Floor Washroom"
    },
    {
        "title": "Wi-Fi outage",
        "description": "Eduroam is completely down in the library since morning.",
        "location": "Central Library"
    },
    {
        "title": "Broken classroom chair",
        "description": "One of the wooden chairs is broken in half.",
        "location": "Room 304, Lecture Hall Complex"
    }
]

if __name__ == "__main__":
    for idx, tc in enumerate(test_cases, 1):
        print(f"\n--- Test Case {idx}: {tc['title']} ---")
        try:
            result = analyze_complaint(tc["title"], tc["description"], tc["location"])
            print("Output:")
            for k, v in result.items():
                print(f"  {k}: {v}")
        except Exception as e:
            print(f"Error: {e}")
