import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { cancelNotification, scheduleNoteReminder } from "@/lib/notifications";
import {
  NotesStorage,
  PreferencesStorage,
  StoredNote,
  StoredPreferences,
  defaultPreferences,
} from "@/lib/storage";

export default function NoteEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [allNotes, setAllNotes] = useState<StoredNote[]>([]);
  const [id, setId] = useState<string | undefined>(params.id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [reminderInput, setReminderInput] = useState("");
  const [preferences, setPreferences] =
    useState<StoredPreferences>(defaultPreferences);

  const parseReminderValue = (value: string) => {
    if (!value.trim()) return null;
    const normalized = value.trim().replace(" ", "T");
    const timestamp = Date.parse(normalized);
    return Number.isNaN(timestamp) ? null : timestamp;
  };

  useEffect(() => {
    PreferencesStorage.load().then((saved) => {
      if (saved) setPreferences(saved);
    });
  }, []);

  useEffect(() => {
    NotesStorage.load().then((saved) => {
      if (!saved) return;
      setAllNotes(saved);

      if (params.id) {
        const existing = saved.find((n) => n.id === params.id);
        if (existing) {
          setId(existing.id);
          setTitle(existing.title);
          setContent(existing.content ?? existing.preview ?? "");
          setImageUri(existing.imageUri ?? null);
          setReminderInput(
            existing.reminderTimestamp
              ? new Date(existing.reminderTimestamp)
                  .toISOString()
                  .slice(0, 16)
                  .replace("T", " ")
              : ""
          );
        }
      }
    });
  }, [params.id]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim() || "Untitled note";
    const trimmedContent = content.trim();
    const reminderTimestamp = parseReminderValue(reminderInput);

    const preview =
      trimmedContent.length > 0 ? trimmedContent.slice(0, 80) : trimmedTitle;

    let updatedNotes: StoredNote[];
    let notificationId: string | null = null;

    if (id) {
      updatedNotes = allNotes.map((n) =>
        n.id === id
          ? {
              ...n,
              title: trimmedTitle,
              preview,
              content: trimmedContent,
              imageUri,
              reminderTimestamp,
              notificationId: n.notificationId,
            }
          : n
      );
      notificationId =
        updatedNotes.find((n) => n.id === id)?.notificationId ?? null;
    } else {
      const newId = Date.now().toString();
      const newNote: StoredNote = {
        id: newId,
        title: trimmedTitle,
        preview,
        content: trimmedContent,
        imageUri,
        reminderTimestamp,
        notificationId: null,
      };
      updatedNotes = [newNote, ...allNotes];
      setId(newId);
      notificationId = null;
    }

    const targetNote =
      updatedNotes.find((note) => note.id === (id ?? updatedNotes[0]?.id)) ??
      null;

    if (targetNote?.notificationId && reminderTimestamp == null) {
      await cancelNotification(targetNote.notificationId);
      targetNote.notificationId = null;
    }

    if (targetNote) {
      targetNote.reminderTimestamp = reminderTimestamp;
      if (reminderTimestamp && preferences.notificationsEnabled) {
        await cancelNotification(targetNote.notificationId);
        const scheduledId = await scheduleNoteReminder(targetNote);
        targetNote.notificationId = scheduledId;
      } else {
        targetNote.notificationId = null;
      }
    }

    setAllNotes(updatedNotes);
    await NotesStorage.save(updatedNotes);
    router.back();
  };

  const handleDelete = async () => {
    if (!id) {
      router.back();
      return;
    }
    const target = allNotes.find((n) => n.id === id);
    if (target?.notificationId) {
      await cancelNotification(target.notificationId);
    }
    const updated = allNotes.filter((n) => n.id !== id);
    setAllNotes(updated);
    await NotesStorage.save(updated);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>{id ? "Edit Note" : "New Note"}</Text>

        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.bodyInput}
          placeholder="Write your note..."
          multiline
          value={content}
          onChangeText={setContent}
        />

        <View style={styles.imageRow}>
          <Pressable style={styles.imageButton} onPress={handlePickImage}>
            <Text style={styles.imageButtonText}>
              {imageUri ? "Change image" : "Add image"}
            </Text>
          </Pressable>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          )}
        </View>

        <Text style={styles.label}>Reminder (YYYY-MM-DD HH:mm)</Text>
        <TextInput
          style={styles.input}
          placeholder="2025-01-05 18:00"
          value={reminderInput}
          onChangeText={setReminderInput}
        />
      </View>

      <View style={styles.footerRow}>
        {id && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        )}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F9FC",
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0F172A",
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  imageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4A6CF7",
  },
  imageButtonText: {
    color: "#4A6CF7",
    fontWeight: "600",
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    color: "#64748B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#4A6CF7",
  },
  saveText: {
    color: "white",
    fontWeight: "600",
  },
});
