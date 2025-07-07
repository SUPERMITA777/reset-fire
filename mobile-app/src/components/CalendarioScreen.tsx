import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native'
import { Calendar } from 'react-native-calendars'
import { useCitasStore } from '../store/citasStore'
import { getCitasPorFecha, getTratamientos } from '../lib/supabase'
import { CitaWithRelations } from '../lib/supabase'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import Icon from 'react-native-vector-icons/MaterialIcons'

const ESTADOS_COLORS = {
  reservado: '#0ea5e9',
  confirmado: '#f97316',
  completado: '#22c55e',
  cancelado: '#ef4444',
}

const ESTADOS_LABELS = {
  reservado: 'Reservado',
  confirmado: 'Confirmado',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

interface CalendarioScreenProps {
  navigation: any
}

export const CalendarioScreen: React.FC<CalendarioScreenProps> = ({ navigation }) => {
  const {
    citas,
    tratamientos,
    selectedDate,
    loading,
    setCitas,
    setTratamientos,
    setLoading,
    setSelectedDate,
    setSelectedCita,
  } = useCitasStore()

  const [refreshing, setRefreshing] = useState(false)
  const [markedDates, setMarkedDates] = useState({})

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [citasData, tratamientosData] = await Promise.all([
        getCitasPorFecha(selectedDate),
        getTratamientos(),
      ])
      
      setCitas(citasData)
      setTratamientos(tratamientosData)
      updateMarkedDates(citasData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      Alert.alert('Error', 'No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const updateMarkedDates = (citasData: CitaWithRelations[]) => {
    const marked: any = {}
    
    citasData.forEach(cita => {
      const date = cita.fecha
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: ESTADOS_COLORS[cita.estado],
        }
      }
    })
    
    setMarkedDates(marked)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleDateSelect = (date: any) => {
    setSelectedDate(date.dateString)
  }

  const handleCitaPress = (cita: CitaWithRelations) => {
    setSelectedCita(cita)
    navigation.navigate('DetalleCita', { cita })
  }

  const handleNuevaCita = () => {
    navigation.navigate('NuevaCita')
  }

  const renderCita = (cita: CitaWithRelations) => (
    <TouchableOpacity
      key={cita.id}
      style={[styles.citaCard, { borderLeftColor: ESTADOS_COLORS[cita.estado] }]}
      onPress={() => handleCitaPress(cita)}
    >
      <View style={styles.citaHeader}>
        <Text style={styles.citaHora}>
          {format(parseISO(`${cita.fecha}T${cita.hora}`), 'HH:mm')}
        </Text>
        <View style={[styles.estadoBadge, { backgroundColor: ESTADOS_COLORS[cita.estado] }]}>
          <Text style={styles.estadoText}>
            {ESTADOS_LABELS[cita.estado]}
          </Text>
        </View>
      </View>
      
      <Text style={styles.citaNombre}>
        {cita.rf_clientes?.nombre_completo || 'Sin nombre'}
      </Text>
      
      <Text style={styles.citaTratamiento}>
        {cita.rf_subtratamientos?.nombre_subtratamiento || 'Sin tratamiento'}
      </Text>
      
      <View style={styles.citaFooter}>
        <Text style={styles.citaBox}>Box {cita.box}</Text>
        <Text style={styles.citaPrecio}>${cita.precio}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendario de Citas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNuevaCita}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Calendar
        onDayPress={handleDateSelect}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#3b82f6',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#3b82f6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3b82f6',
          dayTextColor: '#2d3748',
          textDisabledColor: '#d9d9d9',
          arrowColor: '#3b82f6',
          monthTextColor: '#2d3748',
          indicatorColor: '#3b82f6',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
      />

      <View style={styles.citasContainer}>
        <Text style={styles.sectionTitle}>
          Citas del {format(parseISO(selectedDate), 'EEEE, d \'de\' MMMM', { locale: es })}
        </Text>
        
        <ScrollView
          style={styles.citasList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Cargando citas...</Text>
            </View>
          ) : citas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="event-busy" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No hay citas para este día</Text>
            </View>
          ) : (
            citas.map(renderCita)
          )}
        </ScrollView>
      </View>
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  citasContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  citasList: {
    flex: 1,
  },
  citaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  citaHora: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  citaNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  citaTratamiento: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  citaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  citaBox: {
    fontSize: 14,
    color: '#64748b',
  },
  citaPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
  },
}) 