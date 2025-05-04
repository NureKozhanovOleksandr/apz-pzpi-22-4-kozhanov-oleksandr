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
class VetsActivity : ComponentActivity() {
    private val client = OkHttpClient()
    private val backendUrl = "http://10.0.2.2:5000/api"

    companion object {
        private const val TAG = "VetsActivity"
        private const val PREFS_NAME = "AppPrefs"
        private const val TOKEN_KEY = "auth_token"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var vets by remember { mutableStateOf<List<Vet>>(emptyList()) }
            val scope = rememberCoroutineScope()

            LaunchedEffect(Unit) {
                Log.d(TAG, "LaunchedEffect started")
                val token = getToken()
                if (token != null) {
                    vets = fetchVets(token)
                    Log.d(TAG, "Vets updated: ${vets.size} items")
                } else {
                    Log.d(TAG, "Token is null")
                }
            }

            NavBar(title = "veterinarians", prefsName = PREFS_NAME, tokenKey = TOKEN_KEY) { padding ->
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp)
                ) {
                    items(vets) { vet ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Username", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(vet.username, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Email", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(vet.email, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Specialization", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(vet.specialization, fontSize = 18.sp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Contact Info", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(vet.contactInfo, fontSize = 18.sp)
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

    private suspend fun fetchVets(token: String): List<Vet> {
        val request = Request.Builder()
            .url("$backendUrl/vets/all")
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
                        val vetsList = mutableListOf<Vet>()
                        for (i in 0 until jsonArray.length()) {
                            val jsonObject = jsonArray.getJSONObject(i)
                            val vetData = if (jsonObject.isNull("vetData")) JSONObject() else jsonObject.getJSONObject("vetData")
                            vetsList.add(
                                Vet(
                                    id = if (jsonObject.isNull("_id")) "" else jsonObject.getString("_id"),
                                    username = if (jsonObject.isNull("username")) "Unknown" else jsonObject.getString("username"),
                                    email = if (jsonObject.isNull("email")) "Unknown" else jsonObject.getString("email"),
                                    specialization = if (vetData.isNull("specialization")) "Unknown" else vetData.getString("specialization"),
                                    contactInfo = if (vetData.isNull("contactInfo")) "Not available" else vetData.getString("contactInfo")
                                )
                            )
                        }
                        continuation.resume(vetsList)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing vets: ${e.message}", e)
                        continuation.resume(emptyList())
                    }
                }
            })
        }
    }
}

data class Vet(
    val id: String,
    val username: String,
    val email: String,
    val specialization: String,
    val contactInfo: String
)