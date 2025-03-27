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
                v-for="chat in chats" 
                :key="chat.id"
                :value="chat"
                color="primary"
                variant="plain"
                @click="chooseChat(chat.chat_id)"
              >
                <v-list-item-title>{{ chat.chats.chat }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col>
            <v-container max-width="500" class="messages-container">
              <div ref="messagesList" class="messages-list" v-if="fullChat">
                <v-list>
                  <v-list-item
                    v-for="(message, i) in fullChat.messages"
                    :key="i"
                  >
                    <div  :class="['message-bubble', message.WhoSended === WhoAreYou?['my-message', 'text-right']:'other-message']"><!-- Отвечает за положение сообщения -->
                      <v-list-item-subtitle
                      style="user-select: none; -webkit-user-select: none"
                      >
                      {{ message.WhoSended === WhoAreYou?'You':message.WhoSended }}</v-list-item-subtitle> <!-- Показывает кто написал сообщение -->
                      <v-list-item-title >{{ message.text}}</v-list-item-title><!-- Текст сообщения -->
                    </div>
                  </v-list-item>
                </v-list>
              </div>
              <v-text-field 
                v-if="choosedChat"
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
  const choosedChat = ref<number>()
  const fullChat = ref<{
    chat_id: number,
    chat: string,
    messages: any[]
  }>()
  const chats = ref<any[]>([])
  let socket: ReturnType<typeof io>;
  const messagesList = ref<HTMLElement>();
  const handleLoginSuccess = (token: string) => {
    isAuthenticated.value = true;
    initWebSocket(token);
  };
  const handleUsername = async (username: string) => {
    WhoAreYou.value=username;
    const response = await axios.get(`http://localhost:5000/chat/${username}`)
    chats.value = JSON.parse(response.request.response)

  }
  const WhoAreYou = ref<string>('')

  function onClick() {
    if (text.value.trim()) {
      socket.emit('createMessage', {
        WhoSended: WhoAreYou.value,
        text: text.value,
        chat: choosedChat.value
      });
      text.value = '';
    }
  }

  async function chooseChat(chat_id: number) {
    choosedChat.value = chat_id;
    socket.on('allMessages', (data: any) => {
      if (data)
      {
        fullChat.value = {
          chat_id: data.chat_id,
          chat: data.chat,
          messages: data.messages.map((msg: any) => ({
            id: msg.message_id,
            WhoSended: msg.WhoSended,
            text: msg.text,
            created_at: msg.created_at
            }))
        };
      }
      scrollToBottom();
    });
    await socket.emit('findAllMessage', { chat_id: chat_id });
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

    socket.on('newMessage', (data: any) => {
      if (data.chat===choosedChat.value) fullChat.value?.messages.push(data);
      scrollToBottom();
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });
  }

  onMounted(async()=> {

  })
  onBeforeUnmount(() => {
    if (socket) socket.disconnect();
});
</script>
