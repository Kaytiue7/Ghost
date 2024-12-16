import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 20,
    width:'90%',
    borderRadius: 10,
    shadowColor: '#FFF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  username: {
    color:'#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    color:'#FFFFFF',
    borderBottomWidth: 2,
    paddingLeft: 10,
    marginBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    width: '40%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3,
    alignSelf: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  MainImage: {
    width: '100%',
    height: 300,
    marginBottom: 10,
    borderRadius:10,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imagePickerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContainer: {
    flexDirection: 'column',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    marginTop: 20,
    
},
commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
},
commentMain: {
  flexDirection: 'row',
  marginBottom: 10,
},
commentProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
},
commentUsername: {
    color: '#FFFFFF',
    fontWeight: 'bold',
},
commentTimestamp: {
    color: '#888',
    fontSize: 12,
},
commentText: {
  MinwWidth: '66.66%', // Metnin yatayda 2/3'ünü kaplaması için
  color: '#FFFFFF',
  fontSize: 16,
  paddingLeft:10,
  fontWeight: '500',
},
commentImage: {
  width: '100%',
  height: '100%',
  borderRadius: 5,
  alignItems:'center',
  padding:5, 
},
commentView:{
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
sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
},
modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
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

export default styles;
