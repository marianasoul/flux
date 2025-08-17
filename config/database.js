import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('🔄 Tentando conectar ao MongoDB...');
    console.log('📍 URI:', process.env.DB_URI ? 'Configurada' : 'NÃO CONFIGURADA');
    
    const conn = await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/medstudios', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🍃 MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:');
    console.error('📝 Mensagem:', error.message);
    console.error('🔍 Stack:', error.stack);
    console.error('🌐 URI tentativa:', process.env.DB_URI || 'mongodb://localhost:27017/medstudios');
    process.exit(1);
  }
};

export default connectDB;