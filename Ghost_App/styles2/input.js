import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
      //Alltan beyaz şeritli siyah input
      BottomInputStyle: {
        borderBottomWidth: 2,
        borderBottomColor: '#FFF', 
        padding: 10,
        paddingLeft:15,
        fontSize: 16,
        marginTop: 20,
        width: "100%",
        color: '#FFFFFF',
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
        backgroundColor: '#292929',
      },

      //Focus halinde renk değiştiren dış border içeren input
      InputBorderStyle: {
        borderWidth: 2,
        borderColor: '#888',
        borderRadius: 8,
        marginBottom: 10,
      },
      BorderedInputStyle: {
        backgroundColor: 'transparent',
        color: '#FFF',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        
      },
      InputFocusedBorderStyle: {
        borderColor: '#246DDD',
      },
});

export default styles;
