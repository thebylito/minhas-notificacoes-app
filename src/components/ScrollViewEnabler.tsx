import React from 'react';
import {ScrollView} from 'react-native';

import {withScrollEnabler} from 'react-native-ui-lib';

const ScrollViewEnabler = ({
  scrollEnablerProps,
  children,
  ...extra
}: {
  scrollEnablerProps?: {
    scrollEnabled?: boolean;
    onContentSizeChange?: (contentWidth: number, contentHeight: number) => void;
    onLayout?: (event: any) => void;
  };
  children?: React.ReactNode;
} & Record<string, any>) => {
  return (
    <ScrollView
      scrollEnabled={scrollEnablerProps?.scrollEnabled}
      onContentSizeChange={scrollEnablerProps?.onContentSizeChange}
      onLayout={scrollEnablerProps?.onLayout}
      {...extra}>
      {children}
    </ScrollView>
  );
};

export default withScrollEnabler(ScrollViewEnabler);
