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
                <v-list-item-subtitle disabled>{{ message.whoSended }}</v-list-item-subtitle>
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
  import axios from 'axios';
  import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
  import { io } from "socket.io-client";

  const text = ref('')
  const messages = ref<any[]>([])
  let socket: ReturnType<typeof io>;
  const messagesList = ref<HTMLElement>();

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

  function initWebSocket() {
    socket = io("ws://localhost:8080", {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true
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


  onMounted(()=> {
    initWebSocket();
  })
  onBeforeUnmount(() => {
    if (socket) socket.disconnect();
});
</script>

<style>
.message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 10px;
  word-break: break-word;
}
.my-message {
  margin-left: auto;
  background-color: #2196F3;
  color: white;
  border-radius: 25px 5px 25px 25px;
}

.other-message {
  margin-right: auto;
  background-color: #e0e0e0;
  color: black;
  border-radius: 5px 25px 25px 25px;
}
.messages-container {
  height: calc(100vh - 64px); /* Учитываем высоту верхних элементов */
  display: flex;
  flex-direction: column;
  padding-bottom: 0px; /* Отступ от нижнего поля */
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse; /* Новые сообщения добавляются снизу */

}
.v-list {
  margin-top: auto; /* Прижимаем список к низу */
  min-height: min-content; /* Минимальная высота по содержимому */
}
.inputText {
  max-height: fit-content;
  flex-shrink: 0; /* Фиксируем поле ввода */
}
</style>