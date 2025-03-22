<template >
  <v-card class="auth-card">
    <v-card-title class="text-center">
      <h2>Авторизация</h2>
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="login"
          label="Логин"
          :rules="[required]"
          variant="outlined"
          prepend-inner-icon="mdi-account"
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Пароль"
          :rules="[required]"
          type="password"
          variant="outlined"
          prepend-inner-icon="mdi-lock"
        ></v-text-field>

        <v-alert
          v-if="errorMessage"
          type="error"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="isLoading"
        >
          Войти
        </v-btn>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-center">
      <v-btn variant="text" color="secondary">
        Забыли пароль?
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const emit = defineEmits(['login-success', 'username']);
const login = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const required = (value) => !!value || 'Обязательное поле';

const onSubmit = async () => {
  if (!login.value || !password.value) return;
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const response = await axios.post('http://localhost:5000/auth/login', {
      username: login.value,
      password: password.value
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Сохраняем токен
/*     localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('username', login.value); */
    emit('login-success', response.data.access_token);
    emit('username', login.value)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Ошибка авторизации';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-card {
  max-width: 450px;
  margin: 2rem auto;
  padding: 2rem;
}

.v-card-title h2 {
  font-size: 1.8rem;
  font-weight: 500;
}
</style>