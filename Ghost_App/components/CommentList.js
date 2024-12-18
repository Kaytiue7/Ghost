import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import styles from '../styles/_commentStyle';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const snapshot = await firestore
          .collection('Posts')
          .where('replyedPostID', '==', postId)
          .where('postType', '==', 'Comment')
          .orderBy('createdAt', 'desc') // Tarihe göre sıralama
          .get();

        const commentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentData);
      } catch (error) {
        console.error('Yorumlar çekilirken hata oluştu: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image
        source={{
          uri:
            item.imageUri ||
            'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png',
        }}
        style={styles.commentImage}
      />
      <View style={styles.commentTextContainer}>
        <Text style={styles.commentUsername}>@{item.username || 'Anonim'}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.commentMedia} />
        )}
        {item.videoUri && (
          <Video
            source={{ uri: item.videoUri }}
            style={styles.commentMedia}
            useNativeControls
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={renderComment}
      ListEmptyComponent={
        <Text style={styles.noCommentText}>Henüz yorum yapılmamış.</Text>
      }
    />
  );
};

export default CommentList;
