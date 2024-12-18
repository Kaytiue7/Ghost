import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      },
      modalContent: {
        width: '100%',
        height: '80%',
        backgroundColor: '#222',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
      },
      overlayContainer: {
        width: '100%',
        height: '20%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1, // Overlay'in üstte olmasını sağlamak için
      },
      overlay: {
        flex: 1,
        backgroundColor:'transparent'         // Yumuşak bir siyah arka plan
      },
      dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 5,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
      },
      dragHandle: {
        width: 60,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#CCC',
      },
      headerContainer: {
        backgroundColor: '#FFF',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
      },
      commentList: {
        flex: 1,
        backgroundColor: '#111',
      },
      commentInputContainer: {
        flexDirection: 'column',
        padding: 10,
        backgroundColor: '#333',
      },
      input: {
        backgroundColor: '#444',
        color: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        fontSize: 16,
        flex: 1,  // Bu, input'un genişliğini butondan kalan alanla orantılı hale getirir
      },
      
      sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007bff',
        padding: 10,
        marginHorizontal:10,
        borderRadius: 50,
        width: 50,  // Sabit genişlik
        height: 50, // Sabit yükseklik
      },
      modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
      },
      mediaPickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        
      },
      mediaPickerButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
      },
      profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
      },
      profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
      },
      username: {
        color:'#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
      },
      MainImage: {
        width: '100%',
        height: 300,
        marginBottom: 10,
        borderRadius:10,
      },
      commentContainer: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        alignItems: 'flex-start',
      },
      commentImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
      },
      commentTextContainer: {
        flex: 1,
      },
      commentUsername: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
      },
      commentText: {
        fontSize: 14,
        color: '#555',
      },
      commentMedia: {
        width: '100%',
        height: 200,
        marginVertical: 10,
        borderRadius: 10,
      },
      noCommentText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 20,
      },

});

export default styles;
