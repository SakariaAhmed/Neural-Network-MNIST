from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Flatten, Conv2D, MaxPooling2D, Dropout, Reshape
from tensorflow.keras.utils import to_categorical



def main():
    # 1) Load MNIST data
    (x_train, y_train), (x_test, y_test) = mnist.load_data()

    # 2) Preprocess: scale pixels to [0,1] and one-hot encode labels
    x_train = x_train.astype('float32') / 255.0
    x_test  = x_test.astype('float32') / 255.0
    y_train = to_categorical(y_train, 10)
    y_test  = to_categorical(y_test, 10)

    ## 3) Build the model
    #model = Sequential([
    #    Flatten(input_shape=(28,28)),
    #    Dense(128, activation='relu'),
    #    Dense(10, activation='softmax'),
    #])


    model = Sequential([
      Reshape((28,28,1), input_shape=(28,28)),
      Conv2D(32, (3,3), activation='relu', padding='same'),
      MaxPooling2D(),
      Conv2D(64, (3,3), activation='relu', padding='same'),
      MaxPooling2D(),
      Flatten(),
      Dense(128, activation='relu'),
      Dropout(0.5),
      Dense(10, activation='softmax')
    ])


    # 4) Compile
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # 5) Train
    model.fit(
        x_train, y_train,
        epochs=100,
        batch_size=100,
        validation_split=0.1
    )

    # 6) Save the trained model to HDF5
    model.save('mnist_model.h5')
    print("✅ Model trained and saved to 'mnist_cnn.h5'")

    # 7) Optional: evaluate on test set
    loss, acc = model.evaluate(x_test, y_test, verbose=0)
    print(f"Test accuracy: {acc:.4f}")

if __name__ == "__main__":
    main()



