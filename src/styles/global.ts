import { StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export const globalStyles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    gap: 20,
    padding: 14,
    paddingBottom: 0
  },
   button: {
    backgroundColor: colors.button,
    padding: 10,
    borderRadius: 5,
    fontSize: 20,
    elevation: 8
  },

  buttonText:{
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  titleText: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.titleText,
    alignSelf: "center",
  },
})