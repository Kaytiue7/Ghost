import React, { useState, useEffect, useRef } from "react";
import { firestore } from "../firebase/firebaseConfig";
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Video } from 'expo-av';



export default function PostReplyItem({replyPostID}){

    const [replyDate, setReplyDate]= useState(null);
    const [replyImageUri, setReplyImageUri]= useState(null);
    const [replyVideoUri, setReplyVideoUri]= useState(null);
    const [replyText, setReplyText]= useState(null);

    const [replyProfilePicture, setReplyProfilePicture]= useState(null);
    const [replyUsername, setReplyUsername]= useState(null);

    const [isFullscreen, setIsFullscreen] = useState(false); // New state for fullscreen
    const [showControls, setShowControls] = useState(false); // Controls visibility
    const videoRef = useRef(null); // Ref for Video component

    useEffect(() => {
        const fetchReplyData = async () => {
          try {
            const replyDocRef = firestore.collection('Posts').doc(replyPostID);
            const replyDocSnapshot = await replyDocRef.get();
        
            if (replyDocSnapshot.exists) { 
              const data = replyDocSnapshot.data();
              setReplyDate(data.createdAt?.toDate() || null); // Check if 'createdAt' exists
              setReplyText(data.text);
              setReplyImageUri(data.imageUri);
              setReplyVideoUri(data.videoUri);
        
              if (data.userId) {
                const userDocRef = firestore.collection('Users').doc(data.userId);
                const userDocSnapshot = await userDocRef.get();
                if (userDocSnapshot.exists) {
                  setReplyUsername(userDocSnapshot.data().username);
                  setReplyProfilePicture(userDocSnapshot.data().profilePicture);
                }
              }
            } else {
              console.log('postıd buluınanadı');
            }
          } catch (error) {
            console.error('Error, post listenikren hata oluştu:', error);
          }
        };
    
        fetchReplyData();
      }, []);


      const handleVideoPress = () => {
        if (videoRef.current) {
            videoRef.current.presentFullscreenPlayer();
          }
    };



    return (
        <View style={styles.replyContainer}>
            <View style={styles.replyHeader}>
            <Image source={{ uri: replyProfilePicture || 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png' }} style={styles.replyProfileImage} />
                <View style={{justifyContent:'space-between', flexDirection:'row', width:'80%'}}>
                        <Text style={styles.replyUsername}>@{replyUsername} </Text>
                        <Text style={styles.replyTimestamp}>{replyDate ? replyDate.toLocaleString() : ''}</Text>
                    </View>
            </View>

        <View style={styles.replyMain}>
          {replyImageUri &&(
            <View style={styles.replyView}>
              <Image source={{ uri: replyImageUri }} style={styles.replyImage} />
            </View>
            )}
            {replyVideoUri &&(
              <View style={styles.replyView}>
                <TouchableOpacity onPress={handleVideoPress} activeOpacity={1} style={styles.replyImage}>
                  <Video 
                    ref={videoRef}
                    style={styles.replyImage}
                    source={{ uri: replyVideoUri }}
                    resizeMode="contain"
                    isLooping
                    
                    
                  />
                </TouchableOpacity>
                {showControls && (
                  <View style={styles.replyVideoControl}>
                     
                    <TouchableOpacity onPress={handleVideoPress} style={styles.playPauseButton}>
                      <Ionicons name="play" size={10} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          
          {replyText && (
            <Text style={styles.replyText}>{replyText}</Text>      
          )}
                             
        </View>        
      </View> 
    );
};

const styles = StyleSheet.create({
    replyContainer: {
        flexDirection: 'column',
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        marginTop: 5,
        
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    replyMain: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    replyProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    replyUsername: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    replyTimestamp: {
        color: '#888',
        fontSize: 12,
    },
    replyText: {
      MinwWidth: '66.66%', // Metnin yatayda 2/3'ünü kaplaması için
      color: '#FFFFFF',
      fontSize: 16,
      paddingLeft:10,
      fontWeight: '500',
    },
    replyImage: {
      width: '100%',
      height: '100%',
      borderRadius: 5,
      alignItems:'center',
      padding:5, 
    },
    replyView:{
      maxWidth: '33.33%',
      backgroundColor:'#1c1c1c',
      minWidth:100,
      height: 100,
      borderRadius: 5,
      alignItems:'center',
    },
    sendButton: {
        alignSelf: 'center',
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
    },
    replyVideoControl: {
      flex: 1,
        backgroundColor: '#FFF',
        width:'100%',
        height:'100%',
    },
    playPauseButton: {
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 5,
      alignItems:'center',
      bottom:'10%',
      borderRadius: 50,
    },
    fullscreenButton: {
      position: 'absolute',
      bottom: '2%',
      left: '80%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 2,
      borderRadius: 50,
    },
});
