// import { Feather } from '@expo/vector-icons';
// import React from 'react';
// import {
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { DynamicIslandNotification } from '../../ui';
// import { useRegister } from '../hooks/useRegister';

// const Wrapper = Platform.OS === 'web' ? View : TouchableOpacity;

// export function RegisterForm({ onRegisterSuccess }) {
//   const {
//     name,
//     setName,
//     email,
//     setEmail,
//     password,
//     setPassword,
//     confirmPassword,
//     setConfirmPassword,
//     isLoading,
//     handleRegister,
//   } = useRegister();

//   const [mostrarPassword, setMostrarPassword] = React.useState(false);
//   const [mostrarConfirmPassword, setMostrarConfirmPassword] = React.useState(false);
//   const [mostrarNotificacion, setMostrarNotificacion] = React.useState(false);
//   const [notificacion, setNotificacion] = React.useState({ tipo: 'success', mensaje: '' });

//   React.useEffect(() => {
//     if (isLoading) return;

//     if (notificacion.mensaje) {
//       setMostrarNotificacion(true);
//       const timer = setTimeout(() => {
//         setMostrarNotificacion(false);
//         if (notificacion.tipo === 'success' && onRegisterSuccess) {
//           onRegisterSuccess();
//         }
//       }, 1500);
//       return () => clearTimeout(timer);
//     }
//   }, [isLoading, notificacion]);

//   return (
//     <View style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <Wrapper
//             style={styles.touchable}
//             {...(Platform.OS !== 'web' && { activeOpacity: 1, onPress: Keyboard.dismiss })}
//           >
//             <View style={styles.content}>
//               <View style={styles.header}>
//                 <Text style={styles.logo}>INIAP</Text>
//                 <Text style={styles.subtitle}>Gestión Agrícola</Text>
//               </View>

//               <View style={styles.form}>
//                 <Text style={styles.title}>Crear Cuenta</Text>

//                 <View style={styles.inputContainer}>
//                   <Text style={styles.label}>Nombre completo</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Tu nombre"
//                     placeholderTextColor="#AEAEB2"
//                     value={name}
//                     onChangeText={setName}
//                     autoCapitalize="words"
//                     autoCorrect={false}
//                     editable={!isLoading}
//                   />
//                 </View>

//                 <View style={styles.inputContainer}>
//                   <Text style={styles.label}>Correo electrónico</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="tucorreo@ejemplo.com"
//                     placeholderTextColor="#AEAEB2"
//                     value={email}
//                     onChangeText={setEmail}
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                     editable={!isLoading}
//                   />
//                 </View>

//                 <View style={styles.inputContainer}>
//                   <Text style={styles.label}>Contraseña</Text>
//                   <View style={styles.passwordContainer}>
//                     <TextInput
//                       style={styles.passwordInput}
//                       placeholder="Mínimo 6 caracteres"
//                       placeholderTextColor="#AEAEB2"
//                       value={password}
//                       onChangeText={setPassword}
//                       secureTextEntry={!mostrarPassword}
//                       editable={!isLoading}
//                     />
//                     <TouchableOpacity
//                       style={styles.togglePassword}
//                       onPress={() => setMostrarPassword(!mostrarPassword)}
//                       activeOpacity={0.7}
//                     >
//                       <Feather
//                         name={mostrarPassword ? 'eye-off' : 'eye'}
//                         size={20}
//                         color="#8E8E93"
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <View style={styles.inputContainer}>
//                   <Text style={styles.label}>Confirmar contraseña</Text>
//                   <View style={styles.passwordContainer}>
//                     <TextInput
//                       style={styles.passwordInput}
//                       placeholder="Repite la contraseña"
//                       placeholderTextColor="#AEAEB2"
//                       value={confirmPassword}
//                       onChangeText={setConfirmPassword}
//                       secureTextEntry={!mostrarConfirmPassword}
//                       editable={!isLoading}
//                     />
//                     <TouchableOpacity
//                       style={styles.togglePassword}
//                       onPress={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
//                       activeOpacity={0.7}
//                     >
//                       <Feather
//                         name={mostrarConfirmPassword ? 'eye-off' : 'eye'}
//                         size={20}
//                         color="#8E8E93"
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <TouchableOpacity
//                   style={[styles.button, isLoading && styles.buttonDisabled]}
//                   onPress={handleRegister}
//                   disabled={isLoading}
//                   activeOpacity={0.8}
//                 >
//                   <Text style={styles.buttonText}>
//                     {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Wrapper>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       <DynamicIslandNotification
//         tipo={notificacion.tipo}
//         mensaje={notificacion.mensaje}
//         visible={mostrarNotificacion}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F2F7',
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   touchable: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 32,
//     paddingVertical: 40,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   logo: {
//     fontSize: 44,
//     fontWeight: '700',
//     color: '#34C759',
//     letterSpacing: 2,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginTop: 4,
//     letterSpacing: 0.5,
//   },
//   form: {
//     width: '100%',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#000',
//     textAlign: 'center',
//     marginBottom: 32,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#3C3C43',
//     marginBottom: 8,
//     marginLeft: 4,
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     fontSize: 17,
//     color: '#000',
//     borderWidth: 1,
//     borderColor: '#E5E5EA',
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E5E5EA',
//   },
//   passwordInput: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     fontSize: 17,
//     color: '#000',
//   },
//   togglePassword: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   button: {
//     backgroundColor: '#34C759',
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   buttonDisabled: {
//     backgroundColor: '#AEAEB2',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 17,
//     fontWeight: '600',
//   },
// });
