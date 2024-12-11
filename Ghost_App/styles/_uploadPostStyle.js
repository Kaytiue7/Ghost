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


  borderContainer: {
    flexDirection: 'row', // Yatay hizalama
    
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  borderImage: {
    maxWidth: '33.33%', // Görselin yatayda 3'te 1'ini kaplaması için
    minWidth:100,
    height: 100,
    borderRadius: 5,
    padding:5, // Görsel ile metin arasına boşluk ekler
  },
  borderText: {
    width: '66.66%', // Metnin yatayda 2/3'ünü kaplaması için
    color: '#FFFFFF',
    fontSize: 16,
    paddingLeft:10,
    fontWeight: '500',
  },
  
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex:9999
  },
});

export default styles;
