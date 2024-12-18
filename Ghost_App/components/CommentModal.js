import React from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import styles  from '../styles/_commentStyle';

import CommentInput from './CommentInput';
import CommentList from './CommentList';

const CommentAddItem = ({ CommentToggleModal, postId }) => {

  return (
    <Modal transparent animationType="slide">
      <View style={styles.modalBackground}>
        {/* GestureDetector Tüm Modal İçeriğini Sarıyor */}
        
        <View style={styles.overlayContainer}>
          {/* Modal dışına tıklandığında kapanmasını sağlamak için */}
          <TouchableOpacity onPress={CommentToggleModal} style={styles.overlay} activeOpacity={1}></TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Sürükleme Tutamacı */}
          <View style={styles.dragHandleContainer}>
            <TouchableOpacity style={styles.dragHandle} onPress={CommentToggleModal} />
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Yorumlar</Text>
          </View>

          {/* Yorum Listesi */}
          <View style={styles.commentList}>
            <CommentList postId={postId}/>
          </View>

          {/* Yorum Ekleme Alanı */}
          <CommentInput postId={postId}/>
        </View>
      </View>
    </Modal>
  );
};

export default CommentAddItem;
