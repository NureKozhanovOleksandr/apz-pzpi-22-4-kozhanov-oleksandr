package com.example.vet_clinic.auth

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import kotlin.coroutines.resume
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

class AuthActivity : ComponentActivity() {
    private val client = OkHttpClient()
    private val backendUrl = "http://10.0.2.2:5000/api"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var username by remember { mutableStateOf("") }
            var password by remember { mutableStateOf("") }
            var errorMessage by remember { mutableStateOf("") }
            val scope = rememberCoroutineScope()

            Scaffold(
                modifier = Modifier.fillMaxSize(),
                content = { padding ->
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Vet Clinic",
                            style = MaterialTheme.typography.headlineMedium,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        TextField(
                            value = username,
                            onValueChange = { username = it },
                            label = { Text("Username") },
                            modifier = Modifier.padding(8.dp)
                        )
                        TextField(
                            value = password,
                            onValueChange = { password = it },
                            label = { Text("Password") },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.padding(8.dp)
                        )
                        Button(
                            onClick = {
                                scope.launch {
                                    errorMessage = login(username, password)
                                }
                            },
                            modifier = Modifier.padding(8.dp)
                        ) {
                            Text("Login")
                        }
                        if (errorMessage.isNotEmpty()) {
                            Text(
                                text = errorMessage,
                                color = MaterialTheme.colorScheme.error,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }
                }
            )
        }
    }

    private suspend fun login(username: String, password: String): String {
        val jsonBody = JSONObject().apply {
            put("username", username)
            put("password", password)
        }

        val requestBody = jsonBody.toString().toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("$backendUrl/auth/login")
            .post(requestBody)
            .build()

        return suspendCancellableCoroutine { continuation ->
            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    continuation.resume("Network error: ${e.message}")
                }

                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string()

                    try {
                        val json = JSONObject(responseBody ?: "")

                        if (response.isSuccessful && json.has("token")) {
                            val intent = Intent(this@AuthActivity, com.example.vet_clinic.MainActivity::class.java)
                            startActivity(intent)
                            finish()
                            continuation.resume("")
                        } else if (json.has("message")) {
                            continuation.resume(json.getString("message"))
                        } else {
                            continuation.resume("Unexpected server response")
                        }
                    } catch (e: Exception) {
                        continuation.resume("Invalid response format")
                    }
                }
            })
        }
    }
}
