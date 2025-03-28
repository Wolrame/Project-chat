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
              <v-list-subheader 
                class="d-flex align-center justify-space-between px-2" 
                style="width: 100%;"
              >
                <span>Чаты</span>
                <v-btn
                  icon="mdi-plus"
                  variant="text"
                  density="comfortable"
                  style="margin-left: 400px;"
                  @click="openNewChatDialog"
                ></v-btn>
              </v-list-subheader>
              <v-list-item
                v-for="chat in chats" 
                :key="chat.id"
                :value="chat"
                color="primary"
                variant="plain"
                @click="chooseChat(chat.chat_id)"
              >
                <v-list-item-title >{{ chat.chats.chat }}</v-list-item-title>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    @click="openDeletingChatDialog(chat.chat_id)"
                  ></v-btn>
                </template> 
              </v-list-item>
            </v-list>
          </v-col>
          <v-col>
            <v-container max-width="500" class="messages-container">
              <div ref="messagesList" class="messages-list" v-if="fullChat">
                <v-list>
                  <div v-if="!isAuthenticated">Вы не авторизованы</div>
                  <v-list-item
                    v-else
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
    <v-dialog v-model="showNewChatDialog" max-width="500">
      <v-card>
        <v-card-title>Создать новый чат</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newChatName"
            label="Название чата"
            outlined
          ></v-text-field>
          
          <v-select
            v-model="selectedUsers"
            :items="allUsers"
            label="Выберите участников"
            multiple
            chips
            outlined
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="showNewChatDialog = false; newChatName=''; selectedUsers=[]">Отмена</v-btn>
          <v-btn color="primary" @click="createNewChat">Создать</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDeleteChatDialog" max-width="500">
      <v-card>
        <v-card-title>Удаление чата</v-card-title>
        <v-card-text>Вы уверены, что хотите удалить выбранный чат?</v-card-text>
        <v-card-actions>
          <v-btn @click="showDeleteChatDialog= false">Отмена</v-btn>
          <v-btn color="primary" @click="deleteChat">Да</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts" setup>
  import Auth from "./components/Auth.vue";
  import './styles/settings.scss';
  import axios from 'axios';
  import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
  import { io } from "socket.io-client";

  const showNewChatDialog = ref(false);   //Отвечает за показ окна создания чата
  const newChatName = ref('');            //Имя нового чата
  const selectedUsers= ref<string[]>([]); //Выбранные пользователи для создания чата
  const allUsers = ref<string[]>([]);     //Все пользователи которых можно добавить в чат
  const isAuthenticated = ref(false);     //Отвечает за окно авторизации
  const text = ref('')                    //Текст для отправки сообщения
  const WhoAreYou = ref<string | undefined>('')       //username пользователя
  const choosedChat = ref<number>()       //id выбранного чата
  const fullChat = ref<{                  //массив сообщений выбранного чата
    chat_id: number,
    chat: string,
    messages: any[]
  }>()
  const chats = ref<any[]>([]);            //массив чатов (chat_id, chat)
  let socket: ReturnType<typeof io>;      //Сокет для вебсокета
  const messagesList = ref<HTMLElement>();//HTML элемент окна сообщений
  const showDeleteChatDialog = ref(false);
  const deletingChat = ref<number>();

  const handleLoginSuccess = () => {//
    isAuthenticated.value = true;
    initWebSocket();
  };

  const handleUsername = async () => {
    const cookie = document.cookie?.split('; ').find(c => c.startsWith('username=')|| '');
    const username = cookie?.split('=')[1];
    if (username)
    {
      WhoAreYou.value= username
      const response = await axios.get(`http://localhost:5000/chat/${username}`, {withCredentials: true})
      if (response.data) chats.value = response.data
    }
  }


  async function onClick() {
    try
    {
      if (text.value.trim()) {
        await socket.emit('createMessage', {
          WhoSended: WhoAreYou.value,
          text: text.value,
          chat: choosedChat.value
        });
        text.value = '';
      }
    } 
    catch {console.error('Ошибка отправки сообщения')}
  }

  async function openNewChatDialog() {
    showNewChatDialog.value = !showNewChatDialog.value
    try {
      allUsers.value = await (await axios.get('http://localhost:5000/user')).data.map((user: {username: string}) => user.username)
    } catch (error) {
      console.error(error)
    }
  }

  async function createNewChat() {
    await axios.post('http://localhost:5000/chat/', {
          chat: newChatName.value,
          users: selectedUsers.value
        })
    handleUsername()
    showNewChatDialog.value = !showNewChatDialog.value
    selectedUsers.value=[]; newChatName.value=''; allUsers.value=[]
  }

  async function openDeletingChatDialog(chat_id: number) {
    showDeleteChatDialog.value = true;
    deletingChat.value = chat_id
  }
  async function deleteChat() {
    await axios.delete(`http://localhost:5000/chat/${deletingChat.value}`)
    handleUsername()
    deletingChat.value = 0; showDeleteChatDialog.value=false;
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

  async function initWebSocket() {
    socket = await io("ws://localhost:8080", {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      withCredentials: true, 
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      isAuthenticated.value = true;
      socket.emit('findAllMessage');
    });

    socket.on('newMessage', (data: any) => {
      if (data.chat===choosedChat.value) fullChat.value?.messages.push(data);
      scrollToBottom();
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });
    socket.on('authError', (error) => {
      console.error('Auth error:', error.message);
      isAuthenticated.value = false;
    });
  }

  onMounted(async()=> {
    axios.defaults.withCredentials = true
    try {
      await initWebSocket();
      await handleUsername();
    }
    catch (error) {
      console.log(error);
    }
    console.log(document.cookie)
  })
  onBeforeUnmount(() => {
    if (socket) socket.disconnect();
});
</script>
