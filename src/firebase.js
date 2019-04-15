import firebase from 'firebase';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const config = { 
  apiKey: "***", 
  authDomain: "***", 
  databaseURL: "***", 
  projectId: "***", 
  storageBucket: "***", 
  messagingSenderId: "***"
};

firebase.initializeApp(config);

export default firebase;
