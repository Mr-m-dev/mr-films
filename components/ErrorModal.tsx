import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useState } from "react";
import {
  Clipboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "@/constants/colors";

interface ErrorContextType {
  showError: (error: string | Error, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextType>({
  showError: () => {},
});

export function useErrorModal() {
  return useContext(ErrorContext);
}

interface ErrorInfo {
  message: string;
  context?: string;
  timestamp: number;
}

export function ErrorModalProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [visible, setVisible] = useState(false);
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);
  const insets = useSafeAreaInsets();

  const showError = useCallback((error: string | Error, context?: string) => {
    const message = error instanceof Error ? `${error.name}: ${error.message}\n\n${error.stack || ""}` : error;
    const info: ErrorInfo = { message, context, timestamp: Date.now() };
    setCurrentError(info);
    setErrors((prev) => [info, ...prev]);
    setVisible(true);
  }, []);

  const handleCopy = useCallback(() => {
    if (currentError) {
      Clipboard.setString(
        `${currentError.context ? `[${currentError.context}]\n` : ""}${currentError.message}`
      );
    }
  }, [currentError]);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="warning" size={20} color={C.accent} />
                <Text style={styles.headerTitle}>تفاصيل الخطأ</Text>
              </View>
              <Pressable onPress={() => setVisible(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={C.textSecondary} />
              </Pressable>
            </View>

            {currentError?.context && (
              <Text style={styles.context}>{currentError.context}</Text>
            )}

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator>
              <Text style={styles.errorText} selectable>
                {currentError?.message}
              </Text>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable style={styles.copyBtn} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={16} color={C.text} />
                <Text style={styles.copyText}>نسخ الخطأ</Text>
              </Pressable>
              <Pressable style={styles.closeBtn} onPress={() => setVisible(false)}>
                <Text style={styles.closeBtnText}>إغلاق</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ErrorContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  context: {
    color: C.accent,
    fontSize: 12,
    marginBottom: 8,
    fontFamily: "Inter_500Medium",
  },
  scroll: {
    maxHeight: 250,
    backgroundColor: C.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: C.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  copyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  copyText: {
    color: C.text,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  closeBtn: {
    flex: 1,
    backgroundColor: C.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
