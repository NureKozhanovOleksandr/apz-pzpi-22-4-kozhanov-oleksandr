package com.example.vet_clinic.auth

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
import io.github.cdimascio.dotenv.dotenv
import kotlinx.coroutines.launch
import okhttp3.*
import org.json.JSONObject
import java.io.IOException

class AuthActivity : ComponentActivity() {
    private val client = OkHttpClient()
    private val dotenv = dotenv {
        directory = "/assets"
        ignoreIfMissing = true
    }
    private val backendUrl = dotenv["BACKEND_URL"] ?: "https://default-api-url"

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
        val requestBody = FormBody.Builder()
            .add("username", username)
            .add("password", password)
            .build()

        val request = Request.Builder()
            .url("$backendUrl/auth/login")
            .post(requestBody)
            .build()

        return try {
            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "")
            if (response.isSuccessful && json.getBoolean("success")) {
                startActivity(android.content.Intent(this, com.example.vet_clinic.MainActivity::class.java))
                finish()
                ""
            } else {
                json.getString("message")
            }
        } catch (e: IOException) {
            "Network error"
        }
    }
}