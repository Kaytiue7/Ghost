import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({

      CommentModalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      },
      CommentModal:{
        flexDirection: 'column',
        paddingHorizontal: 5,
        paddingVertical: 2,
        backgroundColor: '#333',
      },
      ModalBackground:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      PopOutModal: {
        backgroundColor: '#222',
        padding: 20,
        width:'90%',
        borderRadius: 15,
        shadowColor: '#3d3d3d',
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
      },
      Modal:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
      }
});

export default styles;
