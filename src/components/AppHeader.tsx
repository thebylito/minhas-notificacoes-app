import React from 'react';
import {View, Text, Button} from 'react-native-ui-lib';

interface AppHeaderProps {
  onRefresh: () => void;
  refreshing?: boolean;
}

export default function AppHeader({
  onRefresh,
  refreshing = false,
}: AppHeaderProps) {
  return (
    <View paddingH-s4 paddingT-s4 paddingB-s2 bg-primaryColor>
      <View row spread centerV>
        <View flex>
          <Text text50 black>
            Minhas Notificações
          </Text>
        </View>

        <Button
          iconSource={{uri: 'refresh'}}
          size="small"
          outline
          outlineColor="white"
          color="white"
          borderRadius={20}
          onPress={onRefresh}
          loading={refreshing}
        />
      </View>
    </View>
  );
}
