<template>
  <v-app>
    <v-main>
      <Auth v-if="!isAuthenticated" @login-success="handleLoginSuccess" @username="handleUsername"/>
      <div v-else>
        <v-row>
          <v-col>
            <v-list 
              max-width="500" 
            >
              <v-list-subheader>Чаты</v-list-subheader>
              <v-list-item
                v-for="(chat, i) in chats"
                :key="i"
                :value="chat"
                color="primary"
                variant="plain"
                @click="chooseChat(chat)"
              >
                <v-list-item-title>{{ chat }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col>
            <v-container max-width="500" class="messages-container">
              <!-- Добавлен wrapper для списка сообщений -->
              <div ref="messagesList" class="messages-list">
                <v-list>
                  <v-list-item
                    v-for="(message, i) in choosedMessages"
                    :key="i"
                  >
                    <div  :class="['message-bubble', message.whoSended===WhoAreYou?['my-message', 'text-right']:'other-message']">
                      <v-list-item-subtitle
                      style="user-select: none; -webkit-user-select: none"
                      >
                      {{ message.whoSended===WhoAreYou?'You':message.whoSended }}</v-list-item-subtitle>
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
          </v-col>
          <v-col></v-col> 
        </v-row>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import Auth from "./components/Auth.vue";
  import './styles/settings.scss';
  import axios from 'axios';
  import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
  import { io } from "socket.io-client";



  const routes = {
  '/auth': Auth
}

  const isAuthenticated = ref(false);
  const text = ref('')
  const choosedChat = ref<string>('')
  const messages = ref<any[]>([])
  const chats = ref<string[]>([
    'Hello-chat',
    'Hello2-chat'
  ])
  const choosedMessages = ref<any[]>([])
  let socket: ReturnType<typeof io>;
  const messagesList = ref<HTMLElement>();
  const handleLoginSuccess = (token: string) => {
    isAuthenticated.value = true;
    initWebSocket(token);
  };
  const handleUsername = (username: string) => {
    WhoAreYou.value=username;
  }
  const WhoAreYou = ref<string>('')

  function onClick() {
    if (text.value.trim()) {
      socket.emit('createMessage', {
        whoSended: WhoAreYou.value,
        text: text.value,
        chat: choosedChat.value
      });
      text.value = '';
    }
  }

  function chooseChat(chat: string) {
    choosedChat.value = chat;
    // Фильтрация сообщений по выбранному чату
    choosedMessages.value = messages.value.filter(
      msg => msg.chat === choosedChat.value
    );
    scrollToBottom();
  }

  const scrollToBottom = () => {
  nextTick(() => {
    if (messagesList.value) {
      messagesList.value.scrollTop = messagesList.value.scrollHeight;
    }
  });
  };

  async function initWebSocket(jwt_token: any) {
    if (!jwt_token) {
      throw console.error('Unauthorized');
    }
    socket = await io("ws://localhost:8080", {
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
/*     initWebSocket(localStorage.getItem("access_token"))
    .then(()=> isAuthenticated.value=true)
    .catch((e)=> {
      isAuthenticated.value=false
      console.error(e);
    }); */
  })
  onBeforeUnmount(() => {
    if (socket) socket.disconnect();
});
</script>
