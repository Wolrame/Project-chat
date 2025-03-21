<template>
  <v-app>
    <v-main>
      <v-container max-width="500" class="messages-container">
        <!-- Добавлен wrapper для списка сообщений -->
        <div ref="messagesList" class="messages-list">
          <v-list>
            <v-list-item
              v-for="message in messages"
              
              :key="message.id"
              
            >
              <div  :class="['message-bubble', message.whoSended==='You'?['my-message', 'text-right']:'other-message']">
                <v-list-item-subtitle
                style="user-select: none; -webkit-user-select: none"
                >
                {{ message.whoSended }}</v-list-item-subtitle>
                <v-list-item-title >{{ message.text}}</v-list-item-title>
              </div>
            </v-list-item>
          </v-list>
        </div>
        <v-text-field 
          class="inputText"
          v-model="text" 
          label="Введите сообщение" 
          variant="outlined" 
          append-inner-icon="mdi-chevron-right" 
          @click:append-inner="onClick">
        </v-text-field>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import './styles/settings.scss';
  import axios from 'axios';
  import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
  import { io } from "socket.io-client";

  const text = ref('')
  const messages = ref<any[]>([])
  let socket: ReturnType<typeof io>;
  const messagesList = ref<HTMLElement>();

  async function get_jwt() {
    try {
    const response = await axios.post('http://localhost:5000/auth/login', {
      username: 'john', 
      password: 'changeme'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}

  function onClick() {
    if (text.value.trim()) {
      socket.emit('createMessage', {
        whoSended: "You",
        text: text.value
      });
      text.value = '';
    }
  }

  const scrollToBottom = () => {
  nextTick(() => {
    if (messagesList.value) {
      messagesList.value.scrollTop = messagesList.value.scrollHeight;
    }
  });
  };

  function initWebSocket(jwt_token: any) {
    socket = io("ws://localhost:8080", {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      auth: {
        token: `Bearer ${jwt_token}` 
      }
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('findAllMessage');
    });

    socket.on('allMessages', (data: any) => {
      messages.value = data;
      scrollToBottom();
    });

    socket.on('newMessage', (data: any) => {
      messages.value.push(data);
      scrollToBottom();
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });
  }


  onMounted(async()=> {
    await get_jwt()
    .then(initWebSocket)
    .catch(console.log)
  })
  onBeforeUnmount(() => {
    if (socket) socket.disconnect();
});
</script>
