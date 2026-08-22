import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

def train_soil_classification(data_dir, img_size=(224, 224), batch_size=32, epochs=10):
    print(f"--- Training Soil Classification Model from {data_dir} ---")
    
    # 1. Image Data Generator with augmentation
    datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2 # Use 20% for validation
    )
    
    train_generator = datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training'
    )
    
    val_generator = datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation'
    )
    
    num_classes = len(train_generator.class_indices)
    print(f"Detected {num_classes} classes: {list(train_generator.class_indices.keys())}")
    
    # 2. Build Model (MobileNetV2 Transfer Learning)
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(*img_size, 3))
    base_model.trainable = False # Freeze base model
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])
    
    # 3. Training
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        verbose=1
    )
    
    # 4. Save Model
    model_dir = 'models'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    model.save(os.path.join(model_dir, 'soil_classifier_model.h5'))
    print(f"\nModel saved as '{os.path.join(model_dir, 'soil_classifier_model.h5')}'")
    
    # 5. Plotting results
    plt.figure(figsize=(12, 4))
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Val Accuracy')
    plt.title('Accuracy over Epochs')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.title('Loss over Epochs')
    plt.legend()
    
    plt.savefig('soil_training_history.png')
    print("Training history plot saved as 'soil_training_history.png'")

if __name__ == "__main__":
    # Use the augmented dataset for training
    train_soil_classification('CyAUG-Dataset', epochs=10)
