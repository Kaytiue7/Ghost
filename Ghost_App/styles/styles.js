import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
      },
      card: {
        backgroundColor: '#1F1F23',
        width: '90%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#D3D3D3',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        elevation: 10,
      },
      logo: {
        marginBottom: 20,
        height: 100,
        width: 100,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
      },
      subtitle: {
        fontSize: 14,
        color: '#D3D3D3', 
        marginBottom: 20,
      },
      inputContainer: {
        width: '100%',
        marginBottom: 15,
      },
      input: {
        borderBottomWidth: 2,
        borderBottomColor: '#FFF', 
        padding: 10,
        fontSize: 16,
        marginTop: 20,
        width: "100%",
        color: '#FFFFFF',
        backgroundColor: '#292929',
      },
      loginButton: {
        backgroundColor: '#0047AB', 
        width: '70%',
        padding: 15,
        borderRadius: 99999,
        alignItems: 'center',
        marginBottom: 50,
        marginTop: 20,
        shadowColor: '#2A5D9E',
        shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        elevation: 10,
      },
      loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
      },
      signup: {
        color: '#D3D3D3',
      },
      signupText: {
        color: '#FFF',
        fontWeight: 'bold',
      },
});
