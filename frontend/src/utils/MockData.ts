import type { User, Message, Conversation } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'You',
  avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  status: 'online'
};

export const users: User[] = [
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    status: 'online'
  },
  {
    id: '3',
    name: 'Marcus Johnson',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    status: 'away',
    lastSeen: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
  },
  {
    id: '4',
    name: 'Emma Rodriguez',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '5',
    name: 'David Park',
    avatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    status: 'online'
  }
];

export const messages: Message[] = [
  {
    id: '1',
    senderId: '2',
    content: 'Hey! How are you doing today?',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    type: 'text',
    status: 'read'
  },
  {
    id: '2',
    senderId: '1',
    content: 'I\'m doing great! Just working on some new features for our app.',
    timestamp: new Date(Date.now() - 50 * 60 * 1000),
    type: 'text',
    status: 'read'
  },
  {
    id: '3',
    senderId: '2',
    content: 'That sounds exciting! Can you tell me more about it?',
    timestamp: new Date(Date.now() - 40 * 60 * 1000),
    type: 'text',
    status: 'read'
  },
  {
    id: '4',
    senderId: '1',
    content: 'Sure! We\'re building a real-time chat system with some really cool features.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'text',
    status: 'delivered'
  },
  {
    id: '5',
    senderId: '2',
    content: 'Wow, that\'s amazing! I\'d love to see it when it\'s ready.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'text',
    status: 'sent'
  }
];

export const conversations: Conversation[] = [
  {
    id: '1',
    participants: [users[0]], // Sarah Chen
    lastMessage: messages[4],
    unreadCount: 2,
    isGroup: false
  },
  {
    id: '2',
    participants: [users[1]], // Marcus Johnson
    lastMessage: {
      id: '6',
      senderId: '3',
      content: 'See you tomorrow!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'text',
      status: 'read'
    },
    unreadCount: 0,
    isGroup: false
  },
  {
    id: '3',
    participants: [users[2]], // Emma Rodriguez
    lastMessage: {
      id: '7',
      senderId: '1',
      content: 'Thanks for the feedback!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'text',
      status: 'delivered'
    },
    unreadCount: 0,
    isGroup: false
  },
  {
    id: '4',
    participants: [users[0], users[1], users[3]], // Group chat
    lastMessage: {
      id: '8',
      senderId: '5',
      content: 'Let\'s meet up this weekend!',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      type: 'text',
      status: 'read'
    },
    unreadCount: 1,
    isGroup: true,
    groupName: 'Weekend Plans',
    groupAvatar: 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
  }
];