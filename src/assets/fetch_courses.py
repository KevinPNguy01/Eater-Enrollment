import requests
import json

def fetch_courses():
    cursor=""
    courses = []
    i = 0
    while cursor is not None and i < 100000:
        endpoint = f"https://anteaterapi.com/v2/rest/coursesCursor"
        headers = {
            "accept": "/*/"
        }
        params = {
            "cursor": cursor
        }
        response = requests.get(endpoint, headers=headers, params=params)
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            break
        response_data = response.json()["data"]
        courses += response_data["items"]
        cursor = response_data["nextCursor"]
        print(response_data["items"][0]["id"])
        i += 1
    with open("src/assets/courses.json", "w") as f:
        json.dump(courses, f, indent=4)

def convert_anteater_to_peterportal():
    with open("src/assets/courses.json", "r") as f:
        courses = json.load(f)
        courses = [
            {
                "id": course["id"],
                "department": course["department"],
                "number": course["courseNumber"],
                "school": course["school"],
                "title": course["title"],
                "restriction": course["restriction"],
                "course_level": course["courseLevel"],
                "description": course["description"],
                "department_name": course["departmentName"],
                "prerequisite_tree": json.dumps(course["prerequisiteTree"]),
                "prerequisite_text": course["prerequisiteText"],
                "prerequisite_list": course["prerequisites"],
                "prerequisite_for": course["dependencies"],
                "repeatability": course["repeatability"],
                "concurrent": course["concurrent"],
                "same_as": course["sameAs"],
                "overlap": course["overlap"],
                "corequisite": course["corequisites"],
                "ge_list": course["geList"],
                "ge_text": course["geText"],

            } for course in courses
        ]
        with open("src/assets/allCourses.json", "w") as f:
            json.dump({"data": {"allCourses": courses}}, f, indent=4)

if __name__ == "__main__":
    # fetch_courses()
    convert_anteater_to_peterportal()