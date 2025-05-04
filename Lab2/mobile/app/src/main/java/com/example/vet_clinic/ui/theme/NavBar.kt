package com.example.vet_clinic.ui.theme

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.layout.PaddingValues
import com.example.vet_clinic.AppointmentsActivity
import com.example.vet_clinic.MainActivity
import com.example.vet_clinic.VetsActivity
import com.example.vet_clinic.auth.AuthActivity
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NavBar(
    title: String,
    prefsName: String = "AppPrefs",
    tokenKey: String = "auth_token",
    content: @Composable (PaddingValues) -> Unit
) {
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Column(modifier = Modifier.padding(start = 16.dp, end = 16.dp)) {
                    Text("Menu", fontSize = 20.sp)
                    NavigationDrawerItem(
                        label = { Text("Animals") },
                        selected = title == "animals",
                        onClick = {
                            scope.launch {
                                drawerState.close()
                                if (title != "animals") {
                                    context.startActivity(Intent(context, MainActivity::class.java))
                                }
                            }
                        }
                    )
                    NavigationDrawerItem(
                        label = { Text("Veterinarians") },
                        selected = title == "veterinarians",
                        onClick = {
                            scope.launch {
                                drawerState.close()
                                if (title != "veterinarians") {
                                    context.startActivity(Intent(context, VetsActivity::class.java))
                                }
                            }
                        }
                    )
                    NavigationDrawerItem(
                        label = { Text("Appointments") },
                        selected = title == "appointments",
                        onClick = {
                            scope.launch {
                                drawerState.close()
                                if (title != "appointments") {
                                    context.startActivity(Intent(context, AppointmentsActivity::class.java))
                                }
                            }
                        }
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    NavigationDrawerItem(
                        label = { Text("Logout") },
                        selected = false,
                        colors = NavigationDrawerItemDefaults.colors(
                            unselectedContainerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f)
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            scope.launch {
                                drawerState.close()
                                val sharedPreferences = context.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
                                sharedPreferences.edit().remove(tokenKey).apply()
                                context.startActivity(Intent(context, AuthActivity::class.java))
                                (context as? androidx.activity.ComponentActivity)?.finish()
                            }
                        }
                    )
                }
            }
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(title, fontSize = 20.sp) },
                    navigationIcon = {
                        IconButton(onClick = {
                            scope.launch {
                                drawerState.open()
                            }
                        }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu")
                        }
                    }
                )
            },
            content = content
        )
    }
}