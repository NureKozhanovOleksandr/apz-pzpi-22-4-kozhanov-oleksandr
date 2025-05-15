from locust import HttpUser, task, between

class VetClinicUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        login_data = {
            "username": "admin",
            "password": "12345678"
        }
        response = self.client.post("/api/auth/login", json=login_data)
        if response.status_code == 200:
            self.token = response.json().get("token")
        else:
            print(f"Login failed: {response.status_code}")

    @task
    def get_animals_all(self):
        # /api/animals/all
        if hasattr(self, "token"):
            self.client.get("/api/animals/all", headers={"Authorization": f"Bearer {self.token}"})

    @task
    def get_vets_all(self):
        # /api/vets/all
        if hasattr(self, "token"):
            self.client.get("/api/vets/all", headers={"Authorization": f"Bearer {self.token}"})

    @task
    def get_appointments_all(self):
        # /api/appointments/all
        if hasattr(self, "token"):
            self.client.get("/api/appointments/all", headers={"Authorization": f"Bearer {self.token}"})