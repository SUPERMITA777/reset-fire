import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useCitasStore } from '../store/citasStore'
import { 
  crearCita, 
  buscarCliente, 
  crearCliente, 
  verificarDisponibilidad,
  Tratamiento,
  SubTratamiento 
} from '../lib/supabase'
import Icon from 'react-native-vector-icons/MaterialIcons'

interface NuevaCitaScreenProps {
  navigation: any
}

export const NuevaCitaScreen: React.FC<NuevaCitaScreenProps> = ({ navigation }) => {
  const { tratamientos, selectedDate } = useCitasStore()
  
  const [formData, setFormData] = useState({
    fecha: selectedDate,
    hora: '09:00',
    box: 1,
    tratamiento_id: '',
    subtratamiento_id: '',
    dni: '',
    nombre_completo: '',
    whatsapp: '',
    precio: 0,
    sena: 0,
    notas: '',
    estado: 'reservado' as const,
  })

  const [subtratamientos, setSubtratamientos] = useState<SubTratamiento[]>([])
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  useEffect(() => {
    if (formData.tratamiento_id) {
      const tratamiento = tratamientos.find(t => t.id === formData.tratamiento_id)
      setSubtratamientos(tratamiento?.rf_subtratamientos || [])
    }
  }, [formData.tratamiento_id, tratamientos])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleWhatsAppChange = async (whatsapp: string) => {
    handleInputChange('whatsapp', whatsapp)
    
    if (whatsapp.length >= 8) {
      try {
        const cliente = await buscarCliente(whatsapp)
        if (cliente) {
          setClienteEncontrado(cliente)
          setFormData(prev => ({
            ...prev,
            nombre_completo: cliente.nombre_completo,
            dni: cliente.dni || '',
          }))
        } else {
          setClienteEncontrado(null)
        }
      } catch (error) {
        console.error('Error buscando cliente:', error)
      }
    }
  }

  const handleSubtratamientoChange = (subtratamientoId: string) => {
    const subtratamiento = subtratamientos.find(s => s.id === subtratamientoId)
    setFormData(prev => ({
      ...prev,
      subtratamiento_id: subtratamientoId,
      precio: subtratamiento?.precio || 0,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.nombre_completo || !formData.whatsapp || !formData.tratamiento_id || !formData.subtratamiento_id) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios')
      return
    }

    setLoading(true)

    try {
      // Verificar disponibilidad
      const disponible = await verificarDisponibilidad(
        formData.fecha,
        formData.hora,
        formData.box
      )

      if (!disponible) {
        Alert.alert('Error', 'El horario seleccionado no está disponible')
        return
      }

      // Crear o buscar cliente
      let clienteId = clienteEncontrado?.id
      if (!clienteId) {
        const nuevoCliente = await crearCliente({
          nombre_completo: formData.nombre_completo,
          dni: formData.dni,
          whatsapp: formData.whatsapp,
        })
        clienteId = nuevoCliente.id
      }

      // Crear cita
      await crearCita({
        cliente_id: clienteId,
        tratamiento_id: formData.tratamiento_id,
        subtratamiento_id: formData.subtratamiento_id,
        fecha: formData.fecha,
        hora: formData.hora,
        box: formData.box,
        estado: formData.estado,
        precio: formData.precio,
        sena: formData.sena,
        notas: formData.notas,
      })

      Alert.alert('Éxito', 'Cita creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ])
    } catch (error) {
      console.error('Error creando cita:', error)
      Alert.alert('Error', 'No se pudo crear la cita')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (label: string, field: string, placeholder: string, required = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={formData[field as keyof typeof formData] as string}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
      />
    </View>
  )

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Cita</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Fecha y Hora */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Fecha *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formData.fecha}</Text>
              <Icon name="calendar-today" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.halfField}>
            <Text style={styles.label}>Hora *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formData.hora}</Text>
              <Icon name="access-time" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Box */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Box *</Text>
          <Picker
            selectedValue={formData.box}
            onValueChange={(value) => handleInputChange('box', value)}
            style={styles.picker}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(box => (
              <Picker.Item key={box} label={`Box ${box}`} value={box} />
            ))}
          </Picker>
        </View>

        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          
          {renderField('WhatsApp', 'whatsapp', 'Ingrese número de WhatsApp', true)}
          {renderField('Nombre Completo', 'nombre_completo', 'Ingrese nombre completo', true)}
          {renderField('DNI (Opcional)', 'dni', '8 dígitos')}
          
          {clienteEncontrado && (
            <View style={styles.clienteEncontrado}>
              <Icon name="check-circle" size={20} color="#22c55e" />
              <Text style={styles.clienteEncontradoText}>Cliente encontrado</Text>
            </View>
          )}
        </View>

        {/* Tratamiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tratamiento</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tratamiento *</Text>
            <Picker
              selectedValue={formData.tratamiento_id}
              onValueChange={(value) => handleInputChange('tratamiento_id', value)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione tratamiento" value="" />
              {tratamientos.map(tratamiento => (
                <Picker.Item 
                  key={tratamiento.id} 
                  label={tratamiento.nombre_tratamiento} 
                  value={tratamiento.id} 
                />
              ))}
            </Picker>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Subtratamiento *</Text>
            <Picker
              selectedValue={formData.subtratamiento_id}
              onValueChange={handleSubtratamientoChange}
              style={styles.picker}
              enabled={!!formData.tratamiento_id}
            >
              <Picker.Item label="Seleccione subtratamiento" value="" />
              {subtratamientos.map(sub => (
                <Picker.Item 
                  key={sub.id} 
                  label={sub.nombre_subtratamiento} 
                  value={sub.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Precios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precios</Text>
          
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Precio *</Text>
              <TextInput
                style={styles.input}
                value={formData.precio.toString()}
                onChangeText={(value) => handleInputChange('precio', parseFloat(value) || 0)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.halfField}>
              <Text style={styles.label}>Seña *</Text>
              <TextInput
                style={styles.input}
                value={formData.sena.toString()}
                onChangeText={(value) => handleInputChange('sena', parseFloat(value) || 0)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* Estado */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Estado *</Text>
          <Picker
            selectedValue={formData.estado}
            onValueChange={(value) => handleInputChange('estado', value)}
            style={styles.picker}
          >
            <Picker.Item label="Reservado" value="reservado" />
            <Picker.Item label="Confirmado" value="confirmado" />
            <Picker.Item label="Completado" value="completado" />
            <Picker.Item label="Cancelado" value="cancelado" />
          </Picker>
        </View>

        {/* Notas */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Notas</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notas}
            onChangeText={(value) => handleInputChange('notas', value)}
            placeholder="Ingrese notas adicionales"
            multiline
            numberOfLines={4}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creando...' : 'Crear Cita'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.fecha)}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false)
            if (date) {
              handleInputChange('fecha', date.toISOString().split('T')[0])
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${formData.hora}`)}
          mode="time"
          onChange={(event, date) => {
            setShowTimePicker(false)
            if (date) {
              handleInputChange('hora', date.toTimeString().slice(0, 5))
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  picker: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  clienteEncontrado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  clienteEncontradoText: {
    marginLeft: 8,
    color: '#166534',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}) 