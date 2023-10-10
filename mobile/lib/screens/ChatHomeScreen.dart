import 'package:flutter/material.dart';
import '../models/chatUsersModel.dart';
import '../widgets/conversationList.dart';

class ChatHomeScreen extends StatelessWidget {
  ChatHomeScreen({Key? key});

  List<ChatUsers> chatUsers = const [
    ChatUsers(
        name: "Benn kaiser",
        messageText: "kuna game kesho saa saba sharp",
        imageURL: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg",
        time: "Now"),
    ChatUsers(
        name: "Lauren Chebet",
        messageText: "wow! that a nice way to think about it",
        imageURL: "https://xsgames.co/randomusers/assets/avatars/female/2.jpg",
        time: "Yesterday"),
    ChatUsers(
        name: "Henry Omosh",
        messageText: "Hey where are you?",
        imageURL: "https://xsgames.co/randomusers/assets/avatars/male/3.jpg",
        time: "31 Mar"),
    ChatUsers(
        name: "Sally",
        messageText: "Busy! Call me in 20 mins",
        imageURL: "https://xsgames.co/randomusers/assets/avatars/female/43.jpg",
        time: "28 Mar"),
    ChatUsers(
        name: "Debra Shiks",
        messageText: "Thankyou, It's awesome",
        imageURL: "https://xsgames.co/randomusers/assets/avatars/male/5.jpg",
        time: "23 Mar"),
    ChatUsers(
        name: "Jacob Pena",
        messageText: "will update you in evening",
        imageURL: "https://xsgames.co/randomusers/assets/avatars/male/6.jpg",
        time: "17 Mar"),
    ChatUsers(
        name: "Mr. Randwet",
        messageText: "we mzee, nitumie notes bna",
        imageURL: "https://xsgames.co/randomusers/assets/avatars/male/7.jpg",
        time: "24 Feb"),
    ChatUsers(
        name: "John Wick",
        messageText: "How are you?",
        imageURL: "https://xsgames.co/randomusers/assets/avatars/male/8.jpg",
        time: "18 Feb"),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 16, right: 16, top: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  const Text(
                    "WeCare",
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.only(
                        left: 8, right: 8, top: 2, bottom: 2),
                    height: 30,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(30),
                      color: Colors.blue[50],
                    ),
                    child: const Row(
                      children: <Widget>[
                        Icon(
                          Icons.add,
                          color: Color.fromARGB(255, 30, 44, 233),
                          size: 20,
                        ),
                        SizedBox(
                          width: 2,
                        ),
                        Text(
                          "new chat",
                          style: TextStyle(
                              fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(
                  hintText: "Search...",
                  hintStyle: TextStyle(color: Colors.grey.shade600),
                  prefixIcon: Icon(
                    Icons.search,
                    color: Colors.grey.shade600,
                    size: 20,
                  ),
                  filled: true,
                  fillColor: Colors.grey.shade100,
                  contentPadding: const EdgeInsets.all(8),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide(color: Colors.grey.shade100),
                  ),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: chatUsers.length,
                itemBuilder: (context, index) {
                  return ConversationList(
                    name: chatUsers[index].name,
                    messageText: chatUsers[index].messageText,
                    imageUrl: chatUsers[index].imageURL,
                    time: chatUsers[index].time,
                    isMessageRead: (index == 0 || index == 3) ? true : false,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
