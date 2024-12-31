import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  

      MediaModal:{
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
      },

      MediaMax: {
        width: '100%',
        height: 350,
        marginBottom: 10,
        borderRadius: 10,
      },
      Media: {
        width: '100%',
        height: 300,
        marginBottom: 10,
        borderRadius: 10,
      },
      MediaMini: {
        maxWidth: '33.33%',
        backgroundColor:'#1c1c1c',
        minWidth:100,
        height: 100,
        borderRadius: 5,
        alignItems:'center',
      },

      ProfilePictureMega: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 20,
      },
      ProfilePictureMax: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
      },
      ProfilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
      },
      ProfilePictureMini: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
      },
});

export default styles;
