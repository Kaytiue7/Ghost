import * as React from 'react';
import { View, Text } from 'react-native';
import { SearchBar } from '@rneui/themed';

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = React.useState("");

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text onPress={() => navigation.navigate('EditUserProfile')} style={{ marginBottom: 20, fontSize: 18, color: 'blue' }}>
        Search Screen
      </Text>
      <SearchBar
        placeholder="Type Here..."
        onChangeText={(text) => setSearch(text)}
        value={search}
        containerStyle={{
          width: '90%',
          backgroundColor: 'black',
          borderTopWidth: 0,
          borderBottomWidth: 0,
        }}
        inputContainerStyle={{
          backgroundColor: '#f0f0f0',
          borderRadius: 10,
        }}
        inputStyle={{
          color: 'black',
          fontSize: 16,
        }}
      />
    </View>
  );
}