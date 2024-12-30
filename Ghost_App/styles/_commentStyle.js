import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
   
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
      headerContainer: {
        backgroundColor: '#FFF',
        paddingVertical: 5,
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
        borderWidth:1,
        borderColor:'#000'
      },
      commentInputContainer: {
        flexDirection: 'column',
        paddingHorizontal: 5,
        paddingVertical: 2,
        backgroundColor: '#333',
      },
      modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
      },
      profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      ProfilePictureMini: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
      },
      username: {
        color:'#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
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
