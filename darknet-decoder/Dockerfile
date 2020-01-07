FROM ubuntu:19.04

RUN apt-get update
RUN apt-get -qqy install \
    build-essential \
    cmake \
    ffmpeg \
    git \
    gfortran \
    libtool \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libavcodec-dev \
    libavformat-dev \
    libxvidcore-dev \
    libx264-dev \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    libv4l-dev \
    libswscale-dev \
    libgtk-3-dev \
    libcanberra-gtk* \
    libatlas-base-dev \
    make \
    pkg-config \
    python3 \
    python3-pip \
    unzip \
    wget \
    x11-apps

# Include later: sudo

# Install cuda
WORKDIR /tmp
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/cuda-ubuntu1804.pin --no-check-certificate
RUN mv cuda-ubuntu1804.pin /etc/apt/preferences.d/cuda-repository-pin-600
RUN wget http://developer.download.nvidia.com/compute/cuda/10.2/Prod/local_installers/cuda-repo-ubuntu1804-10-2-local-10.2.89-440.33.01_1.0-1_amd64.deb --no-check-certificate
RUN dpkg -i cuda-repo-ubuntu1804-10-2-local-10.2.89-440.33.01_1.0-1_amd64.deb
RUN apt-key add /var/cuda-repo-10-2-local-10.2.89-440.33.01/7fa2af80.pub
RUN apt-get update && apt-get -qqy install cuda

# Install OpenCV
#WORKDIR /root
#RUN \
#  wget -O opencv.zip https://github.com/opencv/opencv/archive/4.0.0.zip && \
#  wget -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/4.0.0.zip && \
#  unzip opencv.zip && \
#  unzip opencv_contrib.zip && \
#  mv opencv-4.0.0 opencv && \
#  mv opencv_contrib-4.0.0 opencv_contrib && \
#  mkdir -p /root/opencv/build
#WORKDIR /root/opencv/build
#RUN cmake -D CMAKE_BUILD_TYPE=RELEASE \
#    -D CMAKE_INSTALL_PREFIX=/usr/local \
#    -D OPENCV_EXTRA_MODULES_PATH=~/opencv_contrib/modules \
#    -D WITH_GSTREAMER=ON \
#    -D WITH_FFMPEG=ON \
#    -D BUILD_TESTS=OFF \
#    -D OPENCV_ENABLE_NONFREE=ON \
#    -D INSTALL_PYTHON_EXAMPLES=OFF \
#    -D BUILD_EXAMPLES=OFF .. && \
#  make && \
#  make install

# Install Darknet
#WORKDIR /
#RUN git clone https://github.com/AlexeyAB/darknet.git
#WORKDIR /darknet
#RUN mkdir build-release
#WORKDIR /darknet/build-release
#RUN cmake ..
#RUN make
#RUN make install

# Copy in model
#RUN mkdir /model
#COPY model/ /model/

#COPY requirements.txt .
#RUN pip3 install -r requirements.txt
#WORKDIR /darknet/build-release
