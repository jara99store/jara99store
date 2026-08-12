// ============================================================
//  FIREBASE CONFIG — এখানে আপনার নিজের Firebase প্রজেক্টের তথ্য বসান
// ============================================================
// কীভাবে পাবেন তার ধাপে ধাপে গাইড নিচে দেওয়া আছে (README-FIREBASE-SETUP.txt ফাইলে)
// Firebase Console (console.firebase.google.com) > Project Settings > General >
// "Your apps" সেকশনে গিয়ে Web app যোগ করলেই এই তথ্যগুলো পেয়ে যাবেন।

const firebaseConfig = {
  apiKey: "AIzaSyDn2Cjjn1-HBv1dCWnc5n1nL9GgS_7imT4",
  authDomain: "jara99store-255a5.firebaseapp.com",
  projectId: "jara99store-255a5",
  storageBucket: "jara99store-255a5.firebasestorage.app",
  messagingSenderId: "1071151563527",
  appId: "1:1071151563527:web:5dc8acce28def34f4e7ba2"
};

// এই ফাইলটা ঠিকমতো fill up না করলে ওয়েবসাইট আপনা-আপনি default (built-in) প্রোডাক্ট তথ্য দেখাবে।
// Config বসানোর পর ওয়েবসাইট ও Admin Panel দুটোই Firebase-এর সাথে সংযুক্ত হয়ে যাবে।

const FIREBASE_CONFIGURED = !firebaseConfig.apiKey.startsWith("PASTE_");
