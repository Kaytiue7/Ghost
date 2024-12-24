import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#fffff',
    borderTopWidth: 0,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 20,
  },
  headerStyle: {
    backgroundColor: '#fff',
    shadowOpacity: 1,
    shadowColor: '#000',
    elevation: 10,
    height:32,
  },
  headerImage: {
    width: 45,
    height:45,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  modalStyle: {
    zIndex: 1,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FF6347',
  },
  OrangeCirclePickerButton: {
    backgroundColor: '#FF8C00',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 15,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    zIndex: 2,
  },
  
  
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  closeButton: {
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#FF5722',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,          // Kenarlık genişliğini belirler
    borderColor: '#D8D8D8',     // Kenarlığın rengini belirler
  },

  profileInfo: {
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 2,
    paddingLeft: 10,
    marginBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    width:'40%',
    alignItems: 'center',
    justifyContent:'space-evenly',
    backgroundColor: '#007bff', // Buton arka plan rengi
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3, // Gölgeleme
    alignSelf: 'center', // Butonu ortalar
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // Buton metninin rengi
  },
  sendIcon: {
    
  },
  MainImage: {
    width: '100%',
    height: '300',
    marginBottom: 30,

  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imagePickerButton: {
    width: 50,               // Button size
    height: 50,              // Button size
    borderRadius: 25,        // Rounded corners for the button
    backgroundColor: '#4CAF50', // Background color of the button
    justifyContent: 'center', // Center the icon vertically
    alignItems: 'center',    // Center the icon horizontally
  },
  imagePickerImage: {
    fontSize: 30,  // Adjust the icon size (you can increase or decrease this value)
  },
  imagePickerText: {
    color: '#fff',
    marginLeft: 10,
  },
  
});

export default styles;
