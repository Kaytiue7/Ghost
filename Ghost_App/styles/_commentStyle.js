import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    ModalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        
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

      BlackInputStyle: {
        backgroundColor: '#444',
        color: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        fontSize: 16,
        flex: 1,  
      },
      
      BlueCirlePickerButon: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007bff',
        padding: 10,
        marginHorizontal:10,
        borderRadius: 20,
        width: 40,  // Sabit genişlik
        height: 40, // Sabit yükseklik
      },
      modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
      },
      GreenCirclePickerButtonMini: {
        width: 40,
        height: 40,
        borderRadius: 25,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
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
      MediaStyle: {
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
