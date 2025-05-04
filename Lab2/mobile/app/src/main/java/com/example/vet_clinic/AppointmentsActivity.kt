package com.example.vet_clinic

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vet_clinic.ui.theme.NavBar
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import okhttp3.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import kotlin.coroutines.resume

@OptIn(ExperimentalMaterial3Api::class)
class AppointmentsActivity : ComponentActivity() {
    private val client = OkHttpClient()
    private val backendUrl = "http://10.0.2.2:5000/api"

    companion object {
        private const val TAG = "AppointmentsActivity"
        private const val PREFS_NAME = "AppPrefs"
        private const val TOKEN_KEY = "auth_token"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val animalId = intent.getStringExtra("animalId")
        val animalName = intent.getStringExtra("animalName") ?: "Unknown"
        setContent {
            var appointments by remember { mutableStateOf<List<Appointment>>(emptyList()) }
            val scope = rememberCoroutineScope()
            var showVetDialog by remember { mutableStateOf(false) }
            var selectedVet by remember { mutableStateOf<Vet?>(null) }

            LaunchedEffect(Unit) {
                Log.d(TAG, "LaunchedEffect started")
                val token = getToken()
                if (token != null) {
                    appointments = fetchAppointments(token, animalId)
                    Log.d(TAG, "Appointments updated: ${appointments.size} items")
                } else {
                    Log.d(TAG, "Token is null")
                }
            }

            val title = if (animalId == null) "appointments" else "appointments of $animalName"
            NavBar(title = title, prefsName = PREFS_NAME, tokenKey = TOKEN_KEY) { padding ->
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp)
                ) {
                    items(appointments) { appointment ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Date", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(appointment.date, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Vet", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(appointment.vetName, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Reason", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(appointment.reason, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Diagnosis", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(appointment.diagnosis ?: "Not available", fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Treatment", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(appointment.treatment ?: "Not available", fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Notes", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(appointment.notes ?: "Not available", fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Status", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(appointment.status, fontSize = 18.sp)
                                Button(
                                    onClick = {
                                        scope.launch {
                                            selectedVet = fetchVet(appointment.vetId)
                                            showVetDialog = true
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
                                ) {
                                    Text("Show Vet")
                                }
                            }
                        }
                    }
                }
                if (showVetDialog && selectedVet != null) {
                    AlertDialog(
                        onDismissRequest = { showVetDialog = false },
                        title = { Text("Vet details") },
                        text = {
                            Column {
                                Text("Username: ${selectedVet!!.username}", fontSize = 16.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Email: ${selectedVet!!.email}", fontSize = 16.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Specialization: ${selectedVet!!.specialization}", fontSize = 16.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Contact Info: ${selectedVet!!.contactInfo}", fontSize = 16.sp)
                            }
                        },
                        confirmButton = {},
                        dismissButton = {}
                    )
                }
            }
        }
    }

    private fun getToken(): String? {
        val sharedPreferences = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return sharedPreferences.getString(TOKEN_KEY, null)
    }

    private suspend fun fetchAppointments(token: String, animalId: String?): List<Appointment> {
        val url = if (animalId == null) "$backendUrl/appointments/all" else "$backendUrl/appointments/animal/$animalId"
        val request = Request.Builder()
            .url(url)
            .header("Authorization", "Bearer $token")
            .build()

        return suspendCancellableCoroutine { continuation ->
            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.e(TAG, "Network error: ${e.message}", e)
                    continuation.resume(emptyList())
                }

                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string()
                    try {
                        val jsonArray = JSONArray(responseBody ?: "[]")
                        val appointmentsList = mutableListOf<Appointment>()
                        for (i in 0 until jsonArray.length()) {
                            val jsonObject = jsonArray.getJSONObject(i)
                            appointmentsList.add(
                                Appointment(
                                    id = jsonObject.getString("_id"),
                                    animalId = jsonObject.getString("animalId"),
                                    vetId = jsonObject.getString("vetId"),
                                    date = jsonObject.getString("date"),
                                    vetName = jsonObject.getString("vetName"),
                                    reason = jsonObject.getString("reason"),
                                    diagnosis = if (jsonObject.isNull("diagnosis")) null else jsonObject.getString("diagnosis"),
                                    treatment = if (jsonObject.isNull("treatment")) null else jsonObject.getString("treatment"),
                                    notes = if (jsonObject.isNull("notes")) null else jsonObject.getString("notes"),
                                    status = jsonObject.getString("status")
                                )
                            )
                        }
                        continuation.resume(appointmentsList)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing appointments: ${e.message}", e)
                        continuation.resume(emptyList())
                    }
                }
            })
        }
    }

    private suspend fun fetchVet(vetId: String): Vet? {
        val token = getToken() ?: return null
        val request = Request.Builder()
            .url("$backendUrl/vets/$vetId")
            .header("Authorization", "Bearer $token")
            .build()

        return suspendCancellableCoroutine { continuation ->
            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.e(TAG, "Network error: ${e.message}", e)
                    continuation.resume(null)
                }

                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string()
                    try {
                        val jsonObject = JSONObject(responseBody ?: "{}")
                        val vetData = jsonObject.getJSONObject("vetData")
                        continuation.resume(
                            Vet(
                                id = jsonObject.getString("_id"),
                                username = jsonObject.getString("username"),
                                email = jsonObject.getString("email"),
                                specialization = vetData.getString("specialization"),
                                contactInfo = vetData.getString("contactInfo")
                            )
                        )
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing vet: ${e.message}", e)
                        continuation.resume(null)
                    }
                }
            })
        }
    }
}

data class Appointment(
    val id: String,
    val animalId: String,
    val vetId: String,
    val date: String,
    val vetName: String,
    val reason: String,
    val diagnosis: String?,
    val treatment: String?,
    val notes: String?,
    val status: String
)