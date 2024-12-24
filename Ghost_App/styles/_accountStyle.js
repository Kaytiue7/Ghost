import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
      },
      coverPhoto: {
        width: '100%',
        height: 150,
        backgroundColor:'#246ddd'
      },
      coverImage: {
        width: '100%',
        height: '100%',
      },
      profileDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
      },
      profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginTop: -40,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        borderWidth:1,
      },
      textDetails: {
        marginLeft: 10,
        padding: 5,
      },
      username: {
        fontSize: 18,
        marginBottom: 5,
        fontWeight: 'bold',
        color: '#EBE7E7',
      },
      bio: {
        fontSize: 14,
        color: '#C1C0C0',
      },
      date: {
        fontSize: 12,
        color: '#C1C0C0',
      },
      followInfo: {
        fontSize: 12,
        color: '#EBE7E7',
        marginTop: 5,
      },
      buttonContainer: {
        flexDirection: 'column',
        marginTop: 10,
        paddingHorizontal: 10,
        alignItems: 'flex-end',
        flex: 1,
      },
      BorderButtonStyle: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#696868',
        width: 130,
      },
      followButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        width: 130,
      },
      followingButton: {
        backgroundColor: '#FF1700', // Takip edilen kullanıcı için kırmızı arka plan
      },
      editbuttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        alignSelf:'center',
        alignItems: 'center',
        textAlign: 'center',
      },
      followbuttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        alignSelf:'center',
        textAlign: 'center',
      },
      tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
      },
      tabItem: {
        alignItems: 'center',
        flex: 1,
      },
      tabText: {
        color: '#888',
        fontSize: 14,
      },
      activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
      },
      activeIndicator: {
        width: '40%',
        height: 2,
        backgroundColor: '#007AFF',
        marginTop: 5,
      },
      input: {
        width: '100%',
        backgroundColor: '#1A1A1A',
        color: '#FFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
      },
      textArea: {
        height: 100,
        textAlignVertical: 'top',
      },
      saveButton: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 9999,
        alignItems: 'center',
        marginTop: 16,
        width: '40%',
      },
      saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
      },
});
