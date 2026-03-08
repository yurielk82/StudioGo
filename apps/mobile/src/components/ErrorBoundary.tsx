import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { StyledText, Button, Screen } from '@/design-system';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 전역 에러 바운더리 — 렌더링 에러 시 fallback UI 표시
 * React Native에서는 클래스 컴포넌트로만 구현 가능 (componentDidCatch)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] 렌더링 에러:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Screen>
          <View className="flex-1 items-center justify-center px-6">
            <StyledText variant="heading-lg" className="mb-2 text-center">
              문제가 발생했습니다
            </StyledText>
            <StyledText variant="body-md" className="mb-6 text-center text-neutral-500">
              앱에서 예상치 못한 오류가 발생했습니다.{'\n'}다시 시도해 주세요.
            </StyledText>

            {__DEV__ && this.state.error && (
              <ScrollView className="mb-6 max-h-40 w-full rounded-lg bg-neutral-100 p-4">
                <StyledText variant="body-sm" className="font-mono text-error">
                  {this.state.error.message}
                </StyledText>
              </ScrollView>
            )}

            <Button onPress={this.handleReset} size="lg" fullWidth>
              다시 시도
            </Button>
          </View>
        </Screen>
      );
    }

    return this.props.children;
  }
}
