package com.example.vet_clinic

import android.content.Context
import android.content.Intent
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
import com.example.vet_clinic.auth.AuthActivity
import com.example.vet_clinic.ui.theme.NavBar
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import okhttp3.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import kotlin.coroutines.resume

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {
    private val client = OkHttpClient()
    private val backendUrl = "http://10.0.2.2:5000/api"

    companion object {
        private const val TAG = "MainActivity"
        private const val PREFS_NAME = "AppPrefs"
        private const val TOKEN_KEY = "auth_token"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var animals by remember { mutableStateOf<List<Animal>>(emptyList()) }
            val scope = rememberCoroutineScope()

            LaunchedEffect(Unit) {
                Log.d(TAG, "LaunchedEffect started")
                val token = getToken()
                if (token != null) {
                    animals = fetchAnimals(token)
                    Log.d(TAG, "Animals updated: ${animals.size} items")
                } else {
                    Log.d(TAG, "Token is null")
                }
            }

            NavBar(title = "animals", prefsName = PREFS_NAME, tokenKey = TOKEN_KEY) { padding ->
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp)
                ) {
                    items(animals) { animal ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Name", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(animal.name, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Species", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(animal.species, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Breed", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(animal.breed, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Age", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(animal.age.toString(), fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Weight", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(animal.weight.toString(), fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Owner", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(animal.ownerUsername, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Last Visit", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(animal.lastVisit ?: "No visits", fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Current Temperature", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(animal.currentTemperature?.toString() ?: "Not available", fontSize = 18.sp)
                                Button(
                                    onClick = {
                                        val intent = Intent(this@MainActivity, AppointmentsActivity::class.java)
                                        intent.putExtra("animalId", animal.id)
                                        intent.putExtra("animalName", animal.name)
                                        startActivity(intent)
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp)
                                ) {
                                    Text("Appointments")
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private fun getToken(): String? {
        val sharedPreferences = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return sharedPreferences.getString(TOKEN_KEY, null)
    }

    private suspend fun fetchAnimals(token: String): List<Animal> {
        val request = Request.Builder()
            .url("$backendUrl/animals/all")
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
                        val animalsList = mutableListOf<Animal>()
                        for (i in 0 until jsonArray.length()) {
                            val jsonObject = jsonArray.getJSONObject(i)
                            animalsList.add(
                                Animal(
                                    id = jsonObject.getString("_id"),
                                    name = jsonObject.getString("name"),
                                    species = jsonObject.getString("species"),
                                    breed = jsonObject.getString("breed"),
                                    age = jsonObject.getInt("age"),
                                    weight = jsonObject.getDouble("weight"),
                                    ownerId = jsonObject.getJSONObject("ownerId").getString("_id"),
                                    ownerUsername = jsonObject.getString("ownerUsername"),
                                    lastVisit = if (jsonObject.isNull("lastVisit")) null else jsonObject.getString("lastVisit"),
                                    currentTemperature = if (jsonObject.isNull("currentTemperature")) null else jsonObject.getDouble("currentTemperature")
                                )
                            )
                        }
                        continuation.resume(animalsList)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing animals: ${e.message}", e)
                        continuation.resume(emptyList())
                    }
                }
            })
        }
    }
}

data class Animal(
    val id: String,
    val name: String,
    val species: String,
    val breed: String,
    val age: Int,
    val weight: Double,
    val ownerId: String,
    val ownerUsername: String,
    val lastVisit: String?,
    val currentTemperature: Double?
)